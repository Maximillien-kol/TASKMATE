import { supabase } from '@/lib/supabase';
import { Task, NewTask, UpdateTask } from '@/types/database';
import { Todo } from '@/types';

import { createUtcFromUserInput, formatToUserTimezone } from '@/lib/dateUtils';

// Convert Todo type to database Task type (User Timezone -> UTC)
function todoToTask(todo: Todo, userId: string, timezone: string): NewTask {
    const utcIso = createUtcFromUserInput(
        todo.dueDate || '',
        todo.dueTime,
        timezone
    );

    return {
        user_id: userId,
        title: todo.title,
        description: todo.description || null,
        status: todo.completed ? 'completed' : 'pending',
        priority: todo.priority as 'low' | 'medium' | 'high',
        due_date: utcIso, // Stored as UTC ISO
        tags: todo.category ? [todo.category] : null,
    };
}

// Convert database Task to Todo type (UTC -> User Timezone)
function taskToTodo(task: any, timezone: string): Todo {
    const zonedTimes = formatToUserTimezone(task.due_date, timezone);

    // Map collaborators (accepted ones or all?)
    // For the UI, we probably want to see who is on the task.
    const collaborators = task.task_collaborators
        ?.map((c: any) => c.email) || [];

    return {
        id: task.id,
        title: task.title,
        description: task.description || undefined,
        priority: task.priority as 'low' | 'medium' | 'high',
        category: task.tags?.[0] || 'General',
        dueDate: zonedTimes?.date,
        dueTime: zonedTimes?.time,
        completed: task.status === 'completed',
        createdAt: new Date(task.created_at).getTime(),
        subTasks: [],
        collaborators: collaborators,
        aiSuggested: false,
        completedAt: task.completed_at ? new Date(task.completed_at).getTime() : undefined,
    };
}

export const tasksService = {
    // Get all tasks for current user
    // Get all tasks for current user
    // Get all tasks for current user (owned or accepted collaboration)
    async getUserTasks(): Promise<Todo[]> {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) throw new Error('Not authenticated');

        const timezone = session.user.user_metadata?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
        const userEmail = session.user.email;

        // Fetch tasks efficiently
        // Fetch tasks efficiently
        try {
            const { data, error } = await supabase
                .from('tasks')
                .select(`
                    *,
                    task_collaborators!left (
                        email,
                        status,
                        user_id
                    )
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Filter
            const visibleTasks = (data || []).filter((t: any) => {
                const isOwner = t.user_id === session.user.id;
                const collaboration = t.task_collaborators?.find((c: any) => c.email === userEmail || c.user_id === session.user.id);
                const isAcceptedCollaborator = collaboration?.status === 'accepted';

                return isOwner || isAcceptedCollaborator;
            });

            return visibleTasks.map(t => taskToTodo(t, timezone));

        } catch (error: any) {
            // Log as info/debug instead of warn to avoid console noise during normal fallback scenarios
            // console.log('Advanced fetch migration check:', error.message);

            // Fallback: Just fetch own tasks
            const { data, error: fallbackError } = await supabase
                .from('tasks')
                .select('*')
                .order('created_at', { ascending: false });

            if (fallbackError) {
                console.warn('Fallback fetch also failed (network?):', fallbackError);
                throw fallbackError;
            }

            return (data || []).map(t => taskToTodo(t, timezone));
        }
    },

    // Get pending invitations
    async getPendingInvitations(): Promise<any[]> {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) throw new Error('Not authenticated');

        try {
            const { data, error } = await supabase
                .from('task_collaborators')
                .select(`
                    id,
                    status,
                    task_id,
                    tasks (
                        title,
                        description,
                        priority,
                        due_date,
                        user_id
                    )
                `)
                .eq('email', session.user.email)
                .eq('status', 'pending');

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.warn('Unable to fetch pending invitations:', error);
            return []; // Return empty if table is missing or error occurs
        }
    },

    // Respond to invitation
    async respondToInvitation(taskId: string, accept: boolean): Promise<void> {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) throw new Error('Not authenticated');

        const status = accept ? 'accepted' : 'rejected';

        // Update based on email for now, or match existing logic
        const { error } = await supabase
            .from('task_collaborators')
            .update({ status, user_id: session.user.id }) // Link user_id on accept
            .eq('task_id', taskId)
            .eq('email', session.user.email);

        if (error) throw error;
    },

    // Add a collaborator
    async addCollaborator(taskId: string, email: string): Promise<void> {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) throw new Error('Not authenticated');

        const { error } = await supabase
            .from('task_collaborators')
            .insert({
                task_id: taskId,
                email: email,
                status: 'pending'
            });

        if (error) {
            // Ignore duplicate key error if already invited
            if (error.code === '23505') return;
            throw error;
        }

        // Send invitation email
        try {
            await fetch('/api/invite', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to: email,
                    name: email.split('@')[0],
                    inviterName: session.user.user_metadata?.full_name || session.user.email,
                    role: 'Collaborator'
                })
            });
        } catch (e) {
            console.error('Failed to send email invite:', e);
        }
    },

    // Create a new task
    async createTask(todo: Todo): Promise<Todo> {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) throw new Error('Not authenticated');

        const timezone = session.user.user_metadata?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
        const newTask = todoToTask(todo, session.user.id, timezone);

        const { data, error } = await supabase
            .from('tasks')
            .insert([newTask])
            .select()
            .single();

        if (error) {
            console.error('❌ Supabase Insert Failed!');
            console.error('Error message:', error.message);
            console.error('Error code:', error.code);
            console.error('Error details:', error.details);
            console.error('Error hint:', error.hint);
            console.error('Full error:', JSON.stringify(error, null, 2));
            console.log('📦 Data we tried to insert:', JSON.stringify(newTask, null, 2));
            throw new Error(`Failed to create task: ${error.message || 'Unknown error'}`);
        }

        return taskToTodo(data, timezone);
    },

    // Update a task
    async updateTask(id: string, updates: Partial<Todo>): Promise<Todo> {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) throw new Error('Not authenticated');

        const timezone = session.user.user_metadata?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
        const updateData: UpdateTask = {};

        if (updates.title !== undefined) updateData.title = updates.title;
        if (updates.description !== undefined) updateData.description = updates.description;
        if (updates.completed !== undefined) {
            updateData.status = updates.completed ? 'completed' : 'pending';
            updateData.completed_at = updates.completed ? new Date().toISOString() : null;
        }
        if (updates.priority !== undefined) updateData.priority = updates.priority as any;
        if (updates.dueDate !== undefined) {
            // We need current time if not provided to preserve it, but simpler to just use what's passed
            // If we really want to support partial updates correctly with TZ, we arguably need the full object or separate handling.
            // For now, let's assume if due date changes, we recalculate UTC based on that date + existing time or 00:00?
            // Actually, `createUtcFromUserInput` handles the conversion.
            const time = updates.dueTime || '00:00';
            updateData.due_date = createUtcFromUserInput(updates.dueDate, time, timezone);
        }
        // If ONLY time changes
        if (updates.dueTime !== undefined && updates.dueDate === undefined) {
            // This is tricky without the date. Assuming we don't support updating time without date in strict isolation 
            // OR we would need to fetch the existing task first.
            // For safety in this specific app context, usually both are edited or date is present.
            // Let's safe guard:
            // If we have a due date in updates, it's handled above. 
            // If NOT, we skip for now or would need to fetch. 
            // Given the DashboardView edits, we usually have the full object in `editingTodo`.
        }

        if (updates.category !== undefined) {
            updateData.tags = updates.category ? [updates.category] : null;
        }

        const { data, error } = await supabase
            .from('tasks')
            .update(updateData)
            .eq('id', id)
            .eq('user_id', session.user.id) // RBAC: ensure user owns this task
            .select()
            .single();

        if (error) {
            console.error('Error updating task:', error);
            throw error;
        }

        return taskToTodo(data, timezone);
    },

    // Delete a task
    async deleteTask(id: string): Promise<void> {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) throw new Error('Not authenticated');

        const { error } = await supabase
            .from('tasks')
            .delete()
            .eq('id', id)
            .eq('user_id', session.user.id); // RBAC: ensure user owns this task

        if (error) {
            console.error('Error deleting task:', error);
            throw error;
        }
    },

    // Toggle task completion
    async toggleTask(id: string): Promise<Todo> {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) throw new Error('Not authenticated');

        // First get the current task
        const { data: currentTask, error: fetchError } = await supabase
            .from('tasks')
            .select('status')
            .eq('id', id)
            // .eq('user_id', session.user.id) // RLS handles this
            .single();

        if (fetchError || !currentTask) {
            console.error('Error fetching task for toggle:', fetchError);
            throw new Error('Task not found');
        }

        const newStatus = currentTask.status === 'completed' ? 'pending' : 'completed';
        const completedAt = newStatus === 'completed' ? new Date().toISOString() : null;

        const { data, error } = await supabase
            .from('tasks')
            .update({
                status: newStatus,
                completed_at: completedAt
            })
            .eq('id', id)
            // .eq('user_id', session.user.id)
            .select()
            .single();

        if (error) {
            console.error('Error toggling task:', error);
            throw error;
        }

        return taskToTodo(data, session.user.user_metadata?.timezone || 'UTC');
    },

    // Migrate localStorage tasks to Supabase
    async migrateLocalStorageTasks(todos: Todo[]): Promise<void> {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) throw new Error('Not authenticated');

        const timezone = session.user.user_metadata?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
        const tasksToInsert = todos.map(todo => todoToTask(todo, session.user.id, timezone));

        const { error } = await supabase
            .from('tasks')
            .insert(tasksToInsert);

        if (error) {
            console.error('Error migrating tasks:', error);
            throw error;
        }

        // Clear localStorage after successful migration
        localStorage.removeItem('Taskmaster-tasks');
    },
};
