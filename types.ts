
export type Priority = 'low' | 'medium' | 'high';

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Todo {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  completed: boolean;
  category: string;
  createdAt: number;
  dueDate?: string;
  dueTime?: string;
  subTasks: SubTask[];
  collaborators: string[];
  aiSuggested?: boolean;
  completedAt?: number;
}

export interface AiInsight {
  summary: string;
  suggestion: string;
  productivityScore: number;
}
