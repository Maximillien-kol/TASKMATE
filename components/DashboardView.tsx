'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Todo, Priority, SubTask } from '@/types';
import TaskCard from './TaskCard';
import UserProfileMenu from './UserProfileMenu';
import { parseTaskWithAi, getSmartBreakdown, getDailyInsights } from '@/services/geminiService';
import { tasksService } from '@/services/tasksService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import toast, { Toaster } from 'react-hot-toast';
import { useTaskLimit } from '@/hooks/useTaskLimit';
import Image from 'next/image';

interface DashboardViewProps {
  onBackToLanding: () => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({ onBackToLanding }) => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [aiInsight, setAiInsight] = useState<{ summary: string, advice: string } | null>(null);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);

  const { canCreateTask, incrementTaskCount, getRemainingTasks, getTimeUntilReset, resetLimit } = useTaskLimit();

  // Load tasks from Supabase on mount
  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setIsLoading(true);

      // Check for localStorage tasks to migrate
      const localTasks = localStorage.getItem('Taskmaster-tasks');
      if (localTasks) {
        const parsedTasks = JSON.parse(localTasks);
        if (parsedTasks.length > 0) {
          console.log('Migrating tasks from localStorage to Supabase...');
          await tasksService.migrateLocalStorageTasks(parsedTasks);
        }
      }

      // Load tasks from Supabase
      const tasks = await tasksService.getUserTasks();
      setTodos(tasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    updateInsights();
  }, [todos]);

  const updateInsights = useCallback(async () => {
    if (todos.length > 0) {
      const insights = await getDailyInsights(todos);
      setAiInsight(insights);
    } else {
      setAiInsight(null);
    }
  }, [todos]);

  const handleAddTask = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim()) return;

    // Check rate limit
    if (!canCreateTask()) {
      toast.error(`Limit reached! Next reset in ${getTimeUntilReset()}, Request more tasks`, {
        icon: '',
        style: {
          borderRadius: '10px',
          background: '#fff',
          color: '#000',
        },
      });
      return;
    }

    setIsProcessing(true);
    const loadingId = toast.loading('AI is crafting your task...');

    try {
      console.log('Parsing task:', inputValue);
      const parsedTask = await parseTaskWithAi(inputValue);
      console.log('Parsed result:', parsedTask);

      const newTodo: Todo = {
        id: Math.random().toString(36).substr(2, 9),
        title: parsedTask.title || inputValue,
        description: parsedTask.description,
        priority: parsedTask.priority || 'medium',
        category: parsedTask.category || 'General',
        dueDate: parsedTask.dueDate,
        dueTime: parsedTask.dueTime,
        completed: false,
        createdAt: Date.now(),
        subTasks: parsedTask.subTasks || [],
        collaborators: [],
        aiSuggested: true
      };

      // Save to Supabase
      const createdTask = await tasksService.createTask(newTodo);

      // Update limits and UI
      incrementTaskCount();
      setTodos(prev => [createdTask, ...prev]);
      setInputValue('');

      const remaining = getRemainingTasks() - 1;
      toast.success(`Task created! ${remaining > 0 ? `${remaining} AI tasks left.` : 'Limit reached.'}`, {
        id: loadingId,
      });

    } catch (error) {
      console.error('Error adding task:', error);
      toast.error('Failed to create task.', { id: loadingId });
    } finally {
      setIsProcessing(false);
    }
  };

  const updateTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTodo) return;

    try {
      await tasksService.updateTask(editingTodo.id, editingTodo);
      setTodos(prev => prev.map(t => t.id === editingTodo.id ? editingTodo : t));
      setEditingTodo(null);
    } catch (error) {
      console.error('Error updating task:', error);
      alert('Failed to update task. Please try again.');
    }
  };

  const toggleTodo = async (id: string) => {
    try {
      const updatedTask = await tasksService.toggleTask(id);
      setTodos(prev => prev.map(t => t.id === id ? updatedTask : t));
    } catch (error) {
      console.error('Error toggling task:', error);
    }
  };

  const deleteTodo = async (id: string) => {
    try {
      await tasksService.deleteTask(id);
      setTodos(prev => prev.filter(t => t.id !== id));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleBreakdown = async (id: string) => {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;
    const steps = await getSmartBreakdown(todo);
    const newSubTasks = steps.map(step => ({
      id: Math.random().toString(36).substr(2, 9),
      title: step,
      completed: false
    }));
    setTodos(prev => prev.map(t => t.id === id ? { ...t, subTasks: [...t.subTasks, ...newSubTasks] } : t));
  };

  const toggleSubtask = (todoId: string, subtaskId: string) => {
    setTodos(prev => prev.map(t =>
      t.id === todoId ? {
        ...t,
        subTasks: t.subTasks.map(st =>
          st.id === subtaskId ? { ...st, completed: !st.completed } : st
        )
      } : t
    ));
  };

  const handleAddSubtask = (todoId: string, title: string) => {
    const newSubTask: SubTask = {
      id: Math.random().toString(36).substr(2, 9),
      title: title,
      completed: false
    };

    setTodos(prev => prev.map(t =>
      t.id === todoId ? { ...t, subTasks: [...t.subTasks, newSubTask] } : t
    ));
  };

  const handleAddCollaborator = (todoId: string, name: string) => {
    setTodos(prev => prev.map(t => {
      if (t.id === todoId) {
        if (!t.collaborators.includes(name)) {
          return { ...t, collaborators: [...t.collaborators, name] };
        }
      }
      return t;
    }));
  };

  const handleRemoveCollaborator = (todoId: string, name: string) => {
    setTodos(prev => prev.map(t =>
      t.id === todoId
        ? { ...t, collaborators: t.collaborators.filter(c => c !== name) }
        : t
    ));
  };

  const filteredTodos = useMemo(() => {
    const sorted = [...todos].sort((a, b) => b.createdAt - a.createdAt);
    switch (activeFilter) {
      case 'active': return sorted.filter(t => !t.completed);
      case 'completed': return sorted.filter(t => t.completed);
      default: return sorted;
    }
  }, [todos, activeFilter]);

  const statsData = useMemo(() => {
    const counts = { low: 0, medium: 0, high: 0 };
    todos.forEach(t => {
      if (!t.completed) counts[t.priority]++;
    });
    return [
      { name: 'Low', value: counts.low, color: '#10b981' },
      { name: 'Med', value: counts.medium, color: '#f59e0b' },
      { name: 'High', value: counts.high, color: '#f43f5e' },
    ];
  }, [todos]);

  return (
    <div className="min-h-screen pb-12 bg-slate-50">
      <Toaster position="top-center" />
      {/* Navigation */}
      <nav className="border-b border-slate-200 bg-white sticky top-0 z-40">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center">
              <Image src="/favicon.svg" alt="TaskMaster Logo" width={36} height={36} className="w-9 h-9" />
            </div>
            <span className="text-xl font-medium tracking-tight text-slate-900">TaskMaster</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Workspace</span>

            <button
              onClick={onBackToLanding}
              className="text-sm font-semibold text-slate-600 hover:text-primary transition-colors"
            >
              Home
            </button>
            {/* User Avatar Dropdown */}
            <UserProfileMenu />
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Workspace */}
        <div className="lg:col-span-7 space-y-10">
          <section>
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Capture</h2>
            <div className="bg-white rounded-2xl border border-slate-200 p-1 focus-within:border-indigo-500">
              <form onSubmit={handleAddTask} className="space-y-3">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Ask anything"
                    className="flex-1 bg-transparent px-4 py-3 text-slate-800 placeholder-slate-400 font-normal text-base border-none focus:outline-none focus:ring-0"
                    disabled={isProcessing}
                  />
                  <button
                    type="submit"
                    disabled={isProcessing || !inputValue.trim()}
                    className="bg-slate-900 text-white w-12 h-12 rounded-2xl flex items-center justify-center disabled:opacity-30 shrink-0 hover:bg-slate-800 transition-colors"
                  >
                    {isProcessing ? (
                      <i className="fas fa-spinner fa-spin"></i>
                    ) : (
                      <i className="fas fa-arrow-up"></i>
                    )}
                  </button>
                </div>

                {/* Icon buttons row */}
                <div className="flex items-center gap-2 ">
                  <button
                    type="button"
                    className="w-10 h-10 px-4 py-3 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors"
                    title="Attach file"
                  >
                    <i className="fas fa-paperclip text-sm"></i>
                  </button>

                  <button
                    type="button"
                    className="w-10 h-10 px-4 py-3 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors"
                    title="More options"
                  >
                    <i className="fas fa-ellipsis-h text-sm"></i>
                  </button>
                </div>
              </form>
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Focus</h2>
                <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{filteredTodos.length}</span>
              </div>

              <div className="flex bg-slate-100 p-1 rounded-xl self-start">
                {(['all', 'active', 'completed'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setActiveFilter(f)}
                    className={`px-4 py-1.5 text-xs font-bold rounded-lg capitalize ${activeFilter === f
                      ? 'bg-white text-slate-900'
                      : 'text-slate-500 hover:text-slate-700'
                      }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {filteredTodos.length > 0 ? (
                filteredTodos.map(todo => (
                  <TaskCard
                    key={todo.id}
                    todo={todo}
                    onToggle={toggleTodo}
                    onDelete={deleteTodo}
                    onBreakdown={handleBreakdown}
                    onToggleSubtask={toggleSubtask}
                    onEdit={setEditingTodo}
                    onAddSubtask={handleAddSubtask}
                    onAddCollaborator={handleAddCollaborator}
                    onRemoveCollaborator={handleRemoveCollaborator}
                  />
                ))
              ) : (
                <div className="py-20 flex flex-col items-center justify-center text-center opacity-40">
                  <div className="w-20 h-20 border-2 border-dashed border-slate-300 rounded-full flex items-center justify-center mb-6">
                    <i className="fas fa-feather-pointed text-2xl"></i>
                  </div>
                  <h3 className="font-semibold text-lg">Stillness.</h3>
                  <p className="text-sm mt-1">Nothing requires your attention right now.</p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-5 space-y-8">
          {/* AI Insights */}
          <section className="bg-slate-900 p-8 rounded-3xl text-white border border-slate-800">
            <div className="flex items-center gap-2 mb-6 opacity-60">
              <i className="fas fa-sparkles text-xs"></i>
              <span className="text-xs font-bold uppercase tracking-widest">Task Intelligence</span>
            </div>

            {aiInsight ? (
              <div className="space-y-6">
                <p className="text-lg font-medium leading-relaxed italic">
                  "{aiInsight.summary}"
                </p>
                <div className="pt-6 border-t border-white/10">
                  <p className="text-xs font-bold uppercase tracking-widest opacity-70">Intentional Move</p>
                  <p className="text-sm leading-relaxed font-semibold">{aiInsight.advice}</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4 opacity-20">
                <div className="h-4 bg-current rounded w-full"></div>
                <div className="h-4 bg-current rounded w-3/4"></div>
                <div className="h-20 bg-current/20 rounded-xl w-full"></div>
              </div>
            )}
          </section>

          {/* Productivity Board */}
          <section className="bg-white p-8 rounded-3xl border border-slate-200">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-8">Pulse</h2>

            <div className="h-56 w-full mb-8">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statsData}>
                  <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
                  />
                  <YAxis hide />
                  <Tooltip
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{
                      borderRadius: '12px',
                      backgroundColor: '#ffffff',
                      border: '1px solid #e2e8f0',
                      boxShadow: 'none'
                    }}
                  />
                  <Bar dataKey="value" radius={[6, 6, 6, 6]} barSize={32}>
                    {statsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Active</p>
                <p className="text-xl font-bold text-slate-800">{todos.filter(t => !t.completed).length}</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Done</p>
                <p className="text-xl font-bold text-slate-800">{todos.filter(t => t.completed).length}</p>
              </div>
              <div className="p-4 rounded-2xl bg-indigo-50 text-center border border-indigo-100">
                <p className="text-[10px] font-bold text-indigo-600 uppercase mb-1">Total</p>
                <p className="text-xl font-bold text-indigo-700">{todos.length}</p>
              </div>
            </div>
          </section>
        </aside>
      </main>

      {/* Edit Overlay */}
      {editingTodo && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-lg border border-slate-200 overflow-hidden my-auto">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-xl font-bold tracking-tight text-slate-900">Refine Task</h2>
              <button onClick={() => setEditingTodo(null)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100">
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={updateTodo} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Task Title</label>
                <input
                  type="text"
                  value={editingTodo.title}
                  onChange={(e) => setEditingTodo({ ...editingTodo, title: e.target.value })}
                  className="w-full px-5 py-3 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-indigo-500 text-lg font-medium text-slate-900"
                  required
                />
              </div>

              <div className="space-y-4 pt-2 border-t border-slate-50">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Timeline</label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                      <i className="fas fa-calendar text-xs"></i>
                    </div>
                    <input
                      type="date"
                      value={editingTodo.dueDate || ''}
                      onChange={(e) => setEditingTodo({ ...editingTodo, dueDate: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold text-slate-900 appearance-none"
                    />
                  </div>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                      <i className="fas fa-clock text-xs"></i>
                    </div>
                    <input
                      type="time"
                      value={editingTodo.dueTime || ''}
                      onChange={(e) => setEditingTodo({ ...editingTodo, dueTime: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold text-slate-900 appearance-none"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Context</label>
                <textarea
                  value={editingTodo.description || ''}
                  onChange={(e) => setEditingTodo({ ...editingTodo, description: e.target.value })}
                  className="w-full px-5 py-3 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-indigo-500 text-sm h-24 resize-none text-slate-900"
                  placeholder="Add details..."
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Weight</label>
                  <select
                    value={editingTodo.priority}
                    onChange={(e) => setEditingTodo({ ...editingTodo, priority: e.target.value as Priority })}
                    className="w-full px-5 py-3 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold capitalize appearance-none text-slate-900"
                  >
                    <option value="low">Low Impact</option>
                    <option value="medium">Medium Impact</option>
                    <option value="high">Critical Impact</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Grouping</label>
                  <input
                    type="text"
                    value={editingTodo.category}
                    onChange={(e) => setEditingTodo({ ...editingTodo, category: e.target.value })}
                    className="w-full px-5 py-3 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold text-slate-900"
                  />
                </div>
              </div>
              <div className="pt-4 flex gap-4">
                <button
                  type="button"
                  onClick={() => setEditingTodo(null)}
                  className="flex-1 py-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-100"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  className="flex-1 py-4 rounded-2xl bg-slate-900 text-white font-bold"
                >
                  Confirm Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardView;
