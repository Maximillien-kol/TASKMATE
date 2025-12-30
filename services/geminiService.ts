import { Todo, Priority } from "@/types";

export const parseTaskWithAi = async (input: string): Promise<Partial<Todo>> => {
  try {
    const response = await fetch('/api/parse-task', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input })
    });

    if (!response.ok) throw new Error('Failed to parse task');

    const data = await response.json();
    return {
      title: data.title,
      description: data.description,
      priority: data.priority as Priority,
      category: data.category,
      dueDate: data.dueDate,
      dueTime: data.dueTime,
      subTasks: data.subTasks?.map((st: any) => ({
        id: Math.random().toString(36).substr(2, 9),
        title: st.title,
        completed: false,
      })) || [],
    };
  } catch (error) {
    console.error("AI Parsing Error:", error);
    return { title: input, priority: 'medium', category: 'General', subTasks: [] };
  }
};

export const getSmartBreakdown = async (todo: Todo): Promise<string[]> => {
  try {
    const response = await fetch('/api/breakdown', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: todo.title, description: todo.description })
    });

    if (!response.ok) throw new Error('Failed to breakdown task');

    const data = await response.json();
    return data.steps || [];
  } catch (error) {
    console.error("Breakdown Error:", error);
    return [];
  }
};

export const getDailyInsights = async (todos: Todo[]): Promise<{ summary: string, advice: string }> => {
  try {
    const response = await fetch('/api/insights', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ todos })
    });

    if (!response.ok) throw new Error('Failed to get insights');

    return await response.json();
  } catch (error) {
    return { summary: "Keep pushing forward!", advice: "Focus on your highest priority task first." };
  }
};

export const suggestTaskStructure = async (input: string) => {
  try {
    const response = await fetch('/api/suggest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input })
    });

    if (!response.ok) throw new Error('Failed to suggest task structure');

    return await response.json();
  } catch (error) {
    console.error("Groq Error:", error);
    return null;
  }
};
