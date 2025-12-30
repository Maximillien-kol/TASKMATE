// Supabase Database Types

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string;
                    email: string;
                    full_name: string | null;
                    avatar_url: string | null;
                    role: 'admin' | 'user' | 'guest';
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id: string;
                    email: string;
                    full_name?: string | null;
                    avatar_url?: string | null;
                    role?: 'admin' | 'user' | 'guest';
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    email?: string;
                    full_name?: string | null;
                    avatar_url?: string | null;
                    role?: 'admin' | 'user' | 'guest';
                    created_at?: string;
                    updated_at?: string;
                };
            };
            tasks: {
                Row: {
                    id: string;
                    user_id: string;
                    title: string;
                    description: string | null;
                    status: 'pending' | 'in_progress' | 'completed' | 'archived';
                    priority: 'low' | 'medium' | 'high' | 'urgent';
                    due_date: string | null;
                    completed_at: string | null;
                    tags: string[] | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    title: string;
                    description?: string | null;
                    status?: 'pending' | 'in_progress' | 'completed' | 'archived';
                    priority?: 'low' | 'medium' | 'high' | 'urgent';
                    due_date?: string | null;
                    completed_at?: string | null;
                    tags?: string[] | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    title?: string;
                    description?: string | null;
                    status?: 'pending' | 'in_progress' | 'completed' | 'archived';
                    priority?: 'low' | 'medium' | 'high' | 'urgent';
                    due_date?: string | null;
                    completed_at?: string | null;
                    tags?: string[] | null;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            categories: {
                Row: {
                    id: string;
                    user_id: string;
                    name: string;
                    color: string | null;
                    icon: string | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    name: string;
                    color?: string | null;
                    icon?: string | null;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    name?: string;
                    color?: string | null;
                    icon?: string | null;
                    created_at?: string;
                };
            };
            task_categories: {
                Row: {
                    task_id: string;
                    category_id: string;
                };
                Insert: {
                    task_id: string;
                    category_id: string;
                };
                Update: {
                    task_id?: string;
                    category_id?: string;
                };
            };
        };
    };
}

// Simplified types for use in components
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Task = Database['public']['Tables']['tasks']['Row'];
export type Category = Database['public']['Tables']['categories']['Row'];
export type TaskCategory = Database['public']['Tables']['task_categories']['Row'];

export type NewTask = Database['public']['Tables']['tasks']['Insert'];
export type UpdateTask = Database['public']['Tables']['tasks']['Update'];
export type NewCategory = Database['public']['Tables']['categories']['Insert'];
export type UpdateCategory = Database['public']['Tables']['categories']['Update'];
