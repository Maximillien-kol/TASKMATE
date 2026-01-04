-- Fix infinite recursion in RLS policies

-- 1. Create a secure function to check task ownership without triggering RLS on tasks table
CREATE OR REPLACE FUNCTION public.is_task_owner(_task_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER 
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.tasks 
    WHERE id = _task_id 
    AND user_id = auth.uid()
  );
$$;

-- 2. Drop the problematic policy
DROP POLICY IF EXISTS "Task owners can manage collaborators" ON public.task_collaborators;

-- 3. Re-create the policy using the secure function
CREATE POLICY "Task owners can manage collaborators"
    ON public.task_collaborators
    USING (
        is_task_owner(task_id)
    );
