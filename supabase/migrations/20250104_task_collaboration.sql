-- Create task_collaborators table
CREATE TABLE IF NOT EXISTS public.task_collaborators (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
    email TEXT NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL, -- Linked profile if exists
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(task_id, email)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_task_collaborators_task_id ON public.task_collaborators(task_id);
CREATE INDEX IF NOT EXISTS idx_task_collaborators_email ON public.task_collaborators(email);
CREATE INDEX IF NOT EXISTS idx_task_collaborators_user_id ON public.task_collaborators(user_id);

-- Enable RLS
ALTER TABLE public.task_collaborators ENABLE ROW LEVEL SECURITY;

-- Policies for task_collaborators

-- 1. Task owners can view and manage collaborators for their tasks
CREATE POLICY "Task owners can manage collaborators"
    ON public.task_collaborators
    USING (
        EXISTS (
            SELECT 1 FROM public.tasks
            WHERE tasks.id = task_collaborators.task_id
            AND tasks.user_id = auth.uid()
        )
    );

-- 2. Collaborators can view their own entries (by email or user_id)
CREATE POLICY "Collaborators can view own entries"
    ON public.task_collaborators
    FOR SELECT
    USING (
        email = (auth.jwt() ->> 'email') OR
        user_id = auth.uid()
    );

-- 3. Collaborators can update their own status (e.g., accept invite)
CREATE POLICY "Collaborators can update own status"
    ON public.task_collaborators
    FOR UPDATE
    USING (
        email = (auth.jwt() ->> 'email') OR
        user_id = auth.uid()
    );

-- Update TASKS table policies to allow collaborators to see tasks

-- Collaborators can view tasks they are assigned to (if accepted)
-- Note: 'pending' tasks might need to be visible to show "You have an invite", 
-- but maybe we only show the *task title* or just the *invite* in a separate list.
-- For simplicity, let's allow viewing the task if you are a collaborator (pending or accepted).
CREATE POLICY "Collaborators can view assigned tasks"
    ON public.tasks
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.task_collaborators
            WHERE task_id = tasks.id 
            AND (email = (auth.jwt() ->> 'email') OR user_id = auth.uid())
        )
    );

-- Function to automatically link user_id based on email when a user signs up or is added
-- (Optional, but good for consistency)
