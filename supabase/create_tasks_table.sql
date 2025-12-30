-- =============================================
-- TaskMaster - Create Missing Tables Only
-- =============================================

-- First, check if tasks table exists, if not create it
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'tasks') THEN
        CREATE TABLE public.tasks (
            id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
            title TEXT NOT NULL,
            description TEXT,
            status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'archived')),
            priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
            due_date TIMESTAMP WITH TIME ZONE,
            completed_at TIMESTAMP WITH TIME ZONE,
            tags TEXT[],
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Enable RLS
        ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
        
        -- Create indexes
        CREATE INDEX idx_tasks_user_id ON public.tasks(user_id);
        CREATE INDEX idx_tasks_status ON public.tasks(status);
        CREATE INDEX idx_tasks_priority ON public.tasks(priority);
        CREATE INDEX idx_tasks_due_date ON public.tasks(due_date);
    END IF;
END $$;

-- Create categories table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'categories') THEN
        CREATE TABLE public.categories (
            id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
            name TEXT NOT NULL,
            color TEXT,
            icon TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(user_id, name)
        );
        
        ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
        CREATE INDEX idx_categories_user_id ON public.categories(user_id);
    END IF;
END $$;

-- Create task_categories junction table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'task_categories') THEN
        CREATE TABLE public.task_categories (
            task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
            category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
            PRIMARY KEY (task_id, category_id)
        );
        
        ALTER TABLE public.task_categories ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- =============================================
-- TASKS POLICIES (Only create if they don't exist)
-- =============================================

DO $$ 
BEGIN
    -- Users can view own tasks
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'tasks' AND policyname = 'Users can view own tasks'
    ) THEN
        CREATE POLICY "Users can view own tasks"
            ON public.tasks
            FOR SELECT
            USING (auth.uid() = user_id);
    END IF;

    -- Users can create own tasks
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'tasks' AND policyname = 'Users can create own tasks'
    ) THEN
        CREATE POLICY "Users can create own tasks"
            ON public.tasks
            FOR INSERT
            WITH CHECK (auth.uid() = user_id);
    END IF;

    -- Users can update own tasks
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'tasks' AND policyname = 'Users can update own tasks'
    ) THEN
        CREATE POLICY "Users can update own tasks"
            ON public.tasks
            FOR UPDATE
            USING (auth.uid() = user_id);
    END IF;

    -- Users can delete own tasks
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'tasks' AND policyname = 'Users can delete own tasks'
    ) THEN
        CREATE POLICY "Users can delete own tasks"
            ON public.tasks
            FOR DELETE
            USING (auth.uid() = user_id);
    END IF;
END $$;

-- =============================================
-- CATEGORIES POLICIES
-- =============================================

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'categories' AND policyname = 'Users can view own categories'
    ) THEN
        CREATE POLICY "Users can view own categories"
            ON public.categories
            FOR SELECT
            USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'categories' AND policyname = 'Users can create own categories'
    ) THEN
        CREATE POLICY "Users can create own categories"
            ON public.categories
            FOR INSERT
            WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'categories' AND policyname = 'Users can update own categories'
    ) THEN
        CREATE POLICY "Users can update own categories"
            ON public.categories
            FOR UPDATE
            USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'categories' AND policyname = 'Users can delete own categories'
    ) THEN
        CREATE POLICY "Users can delete own categories"
            ON public.categories
            FOR DELETE
            USING (auth.uid() = user_id);
    END IF;
END $$;

-- =============================================
-- TRIGGERS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and recreate for tasks
DROP TRIGGER IF EXISTS update_tasks_updated_at ON public.tasks;
CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON public.tasks
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();
