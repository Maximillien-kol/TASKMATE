import { supabase } from '@/lib/supabase';
import { Task, NewTask, UpdateTask } from '@/types/database';
import { Todo } from '@/types';

// Convert Todo type to database Task type
function todoToTask(todo: Todo, userId: string): NewTask {
    return {
        user_id: userId,
        title: todo.title,
        description: todo.description || null,
        status: todo.completed ? 'completed' : 'pending',
        priority: todo.priority as 'low' | 'medium' | 'high',
        due_date: todo.dueDate ? new Date(todo.dueDate).toISOString() : null,
        tags: todo.category ? [todo.category] : null,
    };
}

// Convert database Task to Todo type
function taskToTodo(task: Task): Todo {
    return {
        id: task.id,
        title: task.title,
        description: task.description || undefined,
        priority: task.priority as 'low' | 'medium' | 'high',
        category: task.tags?.[0] || 'General',
        dueDate: task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : undefined,
        dueTime: task.due_date ? new Date(task.due_date).toISOString().split('T')[1].slice(0, 5) : undefined,
        completed: task.status === 'completed',
        createdAt: new Date(task.created_at).getTime(),
        subTasks: [],
        collaborators: [],
        aiSuggested: false,
    };
}

export const tasksService = {
    // Get all tasks for current user
    async getUserTasks(): Promise<Todo[]> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { data, error } = await supabase
            .from('tasks')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching tasks:', error);
            throw error;
        }

        return (data || []).map(taskToTodo);
    },

    // Create a new task
    async createTask(todo: Todo): Promise<Todo> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const newTask = todoToTask(todo, user.id);

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

        return taskToTodo(data);
    },

    // Update a task
    async updateTask(id: string, updates: Partial<Todo>): Promise<Todo> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const updateData: UpdateTask = {};

        if (updates.title !== undefined) updateData.title = updates.title;
        if (updates.description !== undefined) updateData.description = updates.description;
        if (updates.completed !== undefined) {
            updateData.status = updates.completed ? 'completed' : 'pending';
            updateData.completed_at = updates.completed ? new Date().toISOString() : null;
        }
        if (updates.priority !== undefined) updateData.priority = updates.priority as any;
        if (updates.dueDate !== undefined) {
            updateData.due_date = updates.dueDate ? new Date(updates.dueDate).toISOString() : null;
        }
        if (updates.category !== undefined) {
            updateData.tags = updates.category ? [updates.category] : null;
        }

        const { data, error } = await supabase
            .from('tasks')
            .update(updateData)
            .eq('id', id)
            .eq('user_id', user.id) // RBAC: ensure user owns this task
            .select()
            .single();

        if (error) {
            console.error('Error updating task:', error);
            throw error;
        }

        return taskToTodo(data);
    },

    // Delete a task
    async deleteTask(id: string): Promise<void> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { error } = await supabase
            .from('tasks')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id); // RBAC: ensure user owns this task

        if (error) {
            console.error('Error deleting task:', error);
            throw error;
        }
    },

    // Toggle task completion
    async toggleTask(id: string): Promise<Todo> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        // First get the current task
        const { data: currentTask } = await supabase
            .from('tasks')
            .select('status')
            .eq('id', id)
            .eq('user_id', user.id)
            .single();

        if (!currentTask) throw new Error('Task not found');

        const newStatus = currentTask.status === 'completed' ? 'pending' : 'completed';
        const completedAt = newStatus === 'completed' ? new Date().toISOString() : null;

        const { data, error } = await supabase
            .from('tasks')
            .update({
                status: newStatus,
                completed_at: completedAt
            })
            .eq('id', id)
            .eq('user_id', user.id)
            .select()
            .single();

        if (error) {
            console.error('Error toggling task:', error);
            throw error;
        }

        return taskToTodo(data);
    },

    // Migrate localStorage tasks to Supabase
    async migrateLocalStorageTasks(todos: Todo[]): Promise<void> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const tasksToInsert = todos.map(todo => todoToTask(todo, user.id));

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
