-- =============================================
-- 5. Collaborators Table
-- =============================================
CREATE TABLE IF NOT EXISTS public.collaborators (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    email TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT DEFAULT 'Viewer' CHECK (role IN ('Viewer', 'Editor', 'Admin')),
    status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Active', 'Inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE public.collaborators ENABLE ROW LEVEL SECURITY;

-- Users can view their own collaborators
DROP POLICY IF EXISTS "Users can view own collaborators" ON public.collaborators;
CREATE POLICY "Users can view own collaborators"
    ON public.collaborators
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can create their own collaborators
DROP POLICY IF EXISTS "Users can create own collaborators" ON public.collaborators;
CREATE POLICY "Users can create own collaborators"
    ON public.collaborators
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update...
DROP POLICY IF EXISTS "Users can update own collaborators" ON public.collaborators;
CREATE POLICY "Users can update own collaborators"
    ON public.collaborators
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Users can delete...
DROP POLICY IF EXISTS "Users can delete own collaborators" ON public.collaborators;
CREATE POLICY "Users can delete own collaborators"
    ON public.collaborators
    FOR DELETE
    USING (auth.uid() = user_id);

-- Invited users can view data (so they can be notified)
DROP POLICY IF EXISTS "Invited users can view their invites" ON public.collaborators;
CREATE POLICY "Invited users can view their invites"
    ON public.collaborators
    FOR SELECT
    USING (email = (auth.jwt() ->> 'email'));

-- Invited users can accept invites (update status)
DROP POLICY IF EXISTS "Invited users can update their invites" ON public.collaborators;
CREATE POLICY "Invited users can update their invites"
    ON public.collaborators
    FOR UPDATE
    USING (email = (auth.jwt() ->> 'email'));

-- Trigger for update
DROP TRIGGER IF EXISTS update_collaborators_updated_at ON public.collaborators;
CREATE TRIGGER update_collaborators_updated_at
    BEFORE UPDATE ON public.collaborators
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

-- Add Indexes
CREATE INDEX IF NOT EXISTS idx_collaborators_user_id ON public.collaborators(user_id);
CREATE INDEX IF NOT EXISTS idx_collaborators_email ON public.collaborators(email);

-- =============================================
-- Profile Access Policy
-- =============================================
-- =============================================
-- Profile Access - Fixed to avoid recursion using RPC
-- =============================================

-- Drop the problematic policy if it exists (to clean up)
DROP POLICY IF EXISTS "Invited users can view inviter profile" ON public.profiles;

-- Create a secure function to fetch invites with profile details
CREATE OR REPLACE FUNCTION get_my_invites()
RETURNS TABLE (
    id UUID,
    role TEXT,
    user_id UUID,
    inviter_name TEXT
) 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.role,
        c.user_id,
        p.full_name as inviter_name
    FROM public.collaborators c
    JOIN public.profiles p ON c.user_id = p.id
    WHERE c.email = (auth.jwt() ->> 'email')
    AND c.status = 'Pending';
END;
$$ LANGUAGE plpgsql;
