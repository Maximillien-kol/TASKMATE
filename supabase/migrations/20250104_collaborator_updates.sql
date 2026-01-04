-- Allow collaborators to update tasks they are assigned to
CREATE POLICY "Collaborators can update assigned tasks"
    ON public.tasks
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.task_collaborators
            WHERE task_id = tasks.id 
            AND (email = (auth.jwt() ->> 'email') OR user_id = auth.uid())
            AND status = 'accepted'
        )
    );
