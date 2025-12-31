
'use client';

import { useState } from 'react';
import { Todo, SubTask } from '@/types';

interface TaskCardProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onBreakdown: (id: string) => Promise<void>;
  onToggleSubtask: (todoId: string, subtaskId: string) => void;
  onEdit: (todo: Todo) => void;
  onAddSubtask: (todoId: string, title: string) => void;
  onAddCollaborator: (todoId: string, name: string) => void;
  onRemoveCollaborator: (todoId: string, name: string) => void;
}

const categoryIcons: Record<string, string> = {
  work: 'fa-briefcase',
  personal: 'fa-user',
  health: 'fa-heart-pulse',
  learning: 'fa-book-open',
  project: 'fa-diagram-project',
  home: 'fa-house',
  finance: 'fa-wallet',
  shopping: 'fa-cart-shopping',
  social: 'fa-comments'
};

const getCategoryIcon = (category: string) => {
  const normalized = category.toLowerCase();
  return categoryIcons[normalized] || 'fa-tag';
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const isSameDay = (d1: Date, d2: Date) =>
      d1.getDate() === d2.getDate() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getFullYear() === d2.getFullYear();

    if (isSameDay(date, today)) return 'Today';
    if (isSameDay(date, tomorrow)) return 'Tomorrow';

    return date.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return dateStr;
  }
};

const TaskCard: React.FC<TaskCardProps> = ({
  todo, onToggle, onDelete, onBreakdown, onToggleSubtask, onEdit, onAddSubtask, onAddCollaborator, onRemoveCollaborator
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [newCollaborator, setNewCollaborator] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const priorityStyles = {
    low: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    medium: 'bg-amber-50 text-amber-700 border-amber-100',
    high: 'bg-rose-50 text-rose-700 border-rose-100'
  };

  const handleAddSubtaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSubtaskTitle.trim()) {
      onAddSubtask(todo.id, newSubtaskTitle.trim());
      setNewSubtaskTitle('');
    }
  };

  const handleAddCollaborator = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCollaborator.trim()) {
      onAddCollaborator(todo.id, newCollaborator.trim());
      setNewCollaborator('');
    }
  };

  const handleAutoGenerate = async () => {
    setIsGenerating(true);
    setIsExpanded(true);
    try {
      await onBreakdown(todo.id);
    } finally {
      setIsGenerating(false);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Robust overdue check
  const isOverdue = !todo.completed && todo.dueDate && (() => {
    const now = new Date();
    const dueDate = new Date(todo.dueDate);
    if (todo.dueTime) {
      const [h, m] = todo.dueTime.split(':').map(Number);
      dueDate.setHours(h, m, 0, 0);
    } else {
      dueDate.setHours(23, 59, 59, 999);
    }
    return now > dueDate;
  })();

  return (
    <div className={`group relative bg-white rounded-2xl border transition-all hover:border-indigo-200 ${todo.completed
      ? 'border-slate-100 opacity-60'
      : isOverdue
        ? 'border-rose-300 bg-rose-50/20 shadow-sm shadow-rose-100/50'
        : 'border-slate-200 shadow-sm'
      }`}>
      {isOverdue && (
        <div className="absolute -top-2.5 -left-2 bg-rose-600 text-white text-[9px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-md shadow-sm z-10 animate-pulse">
          <i className="fas fa-flag mr-1"></i> Overdue
        </div>
      )}

      <div className="p-3 sm:p-5 relative">
        <div className="flex flex-wrap items-center gap-2 mb-1 sm:mb-2">
          <button
            onClick={() => onToggle(todo.id)}
            className={`shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${todo.completed ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 hover:border-indigo-400'
              }`}
          >
            {todo.completed && <i className="fas fa-check text-[10px]"></i>}
          </button>
          <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-md border ${priorityStyles[todo.priority]}`}>
            {todo.priority}
          </span>
          <span className="text-[10px] text-slate-500 font-semibold bg-slate-100 px-2 py-0.5 rounded-md flex items-center gap-1.5">
            <i className={`fas ${getCategoryIcon(todo.category)} text-[9px]`}></i>
            {todo.category}
          </span>

          {/* Action Buttons (Edit, AI, Delete) */}
          <div className="flex items-center gap-1 ml-auto sm:ml-2">
            <button
              onClick={() => onEdit(todo)}
              title="Edit Task"
              className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all ${isOverdue ? 'text-rose-400 hover:text-rose-600 hover:bg-rose-100' : 'text-slate-400 hover:text-indigo-600 hover:bg-slate-50'}`}
            >
              <i className="fas fa-pen text-[10px]"></i>
            </button>
            <button
              onClick={handleAutoGenerate}
              disabled={isGenerating}
              title="AI Breakdown"
              className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all ${isOverdue ? 'text-rose-500 hover:bg-rose-100' : 'text-indigo-500 hover:bg-indigo-50'} ${isGenerating ? 'opacity-50' : ''}`}
            >
              {isGenerating ? <i className="fas fa-circle-notch animate-spin text-[10px]"></i> : <i className="fas fa-wand-sparkles text-[10px]"></i>}
            </button>
            <button
              onClick={() => onDelete(todo.id)}
              title="Delete Task"
              className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all ${isOverdue ? 'text-rose-400 hover:text-rose-600 hover:bg-rose-100' : 'text-slate-400 hover:text-rose-500 hover:bg-rose-50'}`}
            >
              <i className="fas fa-trash text-[10px]"></i>
            </button>
          </div>

          {/* Date/Time Badge */}
          {(todo.dueDate || todo.dueTime) && (
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1.5 transition-colors ${isOverdue
              ? 'bg-rose-600 text-white shadow-sm'
              : 'bg-slate-100 text-slate-500'
              }`}>
              <i className={`fas ${isOverdue ? 'fa-triangle-exclamation' : 'fa-calendar-day'} text-[9px]`}></i>
              <span className="uppercase tracking-tight flex items-center gap-1">
                <span>{formatDate(todo.dueDate || '')}</span>
                {todo.dueTime && (
                  <>
                    <span className="opacity-50">@</span>
                    <span>{todo.dueTime}</span>
                  </>
                )}
              </span>
            </span>
          )}

          {/* Collaborators row */}
          {todo.collaborators && todo.collaborators.length > 0 && (
            <div className="flex -space-x-2 ml-1">
              {todo.collaborators.map((c, i) => (
                <div
                  key={i}
                  title={c}
                  className="w-5 h-5 rounded-full border border-white bg-indigo-100 flex items-center justify-center text-[8px] font-bold text-indigo-600 cursor-help"
                >
                  {getInitials(c)}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="w-full">
          <h3 className={`text-base font-medium ${todo.completed ? 'line-through text-slate-400' : isOverdue ? 'text-rose-900' : 'text-slate-900'
            }`}>
            {todo.title}
          </h3>

          {todo.description && (
            <p className={`text-sm mt-0.5 sm:mt-1 leading-relaxed ${isOverdue ? 'text-rose-700/70' : 'text-slate-500'}`}>
              {todo.description}
            </p>
          )}
        </div>

        <div className="mt-2 sm:mt-4 space-y-1 sm:space-y-2">
          <div className={`flex items-center justify-between text-xs ${isOverdue ? 'text-rose-500' : 'text-slate-400'}`}>
            <span className="font-medium">
              {todo.subTasks.length > 0 ? `${todo.subTasks.filter(s => s.completed).length} / ${todo.subTasks.length} steps completed` : 'No steps yet'}
            </span>
            <div className="flex items-center gap-3">
              <button
                onClick={handleAutoGenerate}
                disabled={isGenerating}
                className={`${isOverdue ? 'text-rose-600 hover:text-rose-700' : 'text-indigo-600 hover:text-indigo-700'} transition-colors flex items-center gap-1 font-bold disabled:opacity-50`}
              >
                {isGenerating ? (
                  <i className="fas fa-circle-notch animate-spin text-[10px]"></i>
                ) : (
                  <i className="fas fa-wand-sparkles text-[10px]"></i>
                )}
                {isGenerating ? 'Analyzing...' : 'Auto-steps'}
              </button>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="hover:text-slate-600 transition-colors flex items-center gap-1"
              >
                <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'} text-[10px]`}></i>
                {isExpanded ? 'Hide' : 'View'}
              </button>
            </div>
          </div>

          {isExpanded && (
            <div className="pt-2 space-y-0 sm:space-y-4">
              {/* Steps Section */}
              <div className="space-y-2.5">
                <h4 className={`text-[10px] font-bold uppercase tracking-widest ${isOverdue ? 'text-rose-400' : 'text-slate-400'}`}>Steps</h4>
                {todo.subTasks.map(st => (
                  <label key={st.id} className="flex items-center gap-3 cursor-pointer group/item">
                    <input
                      type="checkbox"
                      checked={st.completed}
                      onChange={() => onToggleSubtask(todo.id, st.id)}
                      className={`rounded w-4 h-4 bg-transparent border-slate-300 ${isOverdue ? 'text-rose-600 focus:ring-rose-500' : 'text-indigo-600 focus:ring-indigo-500'}`}
                    />
                    <span className={`text-sm transition-colors ${st.completed
                      ? 'line-through text-slate-400'
                      : isOverdue
                        ? 'text-rose-800 group-hover/item:text-rose-600'
                        : 'text-slate-600 group-hover/item:text-indigo-600'
                      }`}>
                      {st.title}
                    </span>
                  </label>
                ))}

                <form onSubmit={handleAddSubtaskSubmit} className={`flex items-center gap-2 pt-2 border-t ${isOverdue ? 'border-rose-100' : 'border-slate-50'}`}>
                  <div className={`w-4 h-4 flex items-center justify-center ${isOverdue ? 'text-rose-300' : 'text-slate-300'}`}>
                    <i className="fas fa-plus text-[10px]"></i>
                  </div>
                  <input
                    type="text"
                    value={newSubtaskTitle}
                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                    placeholder="Add a step..."
                    className={`flex-1 bg-transparent border-none focus:ring-0 p-0 text-sm font-normal ${isOverdue ? 'text-rose-900 placeholder-rose-300' : 'text-slate-600 placeholder-slate-300'
                      }`}
                  />
                  {newSubtaskTitle && (
                    <button type="submit" className={`text-xs font-bold px-2 py-1 ${isOverdue ? 'text-rose-600 hover:text-rose-700' : 'text-indigo-600 hover:text-indigo-700'}`}>
                      Add
                    </button>
                  )}
                </form>
              </div>

              {/* Collaborators Section */}
              <div className={`space-y-2.5 pt-2 border-t ${isOverdue ? 'border-rose-100' : 'border-slate-50'}`}>
                <h4 className={`text-[10px] font-bold uppercase tracking-widest ${isOverdue ? 'text-rose-400' : 'text-slate-400'}`}>Collaborators</h4>
                <div className="flex flex-wrap gap-2">
                  {todo.collaborators.map((name, idx) => (
                    <div key={idx} className={`${isOverdue ? 'bg-rose-100/50 text-rose-700' : 'bg-slate-50 text-slate-600'} px-2 py-1 rounded-lg text-xs flex items-center gap-2 group/collab`}>
                      <span>{name}</span>
                      <button
                        onClick={() => onRemoveCollaborator(todo.id, name)}
                        className={`transition-colors ${isOverdue ? 'text-rose-300 hover:text-rose-600' : 'text-slate-300 hover:text-rose-500'}`}
                      >
                        <i className="fas fa-times text-[10px]"></i>
                      </button>
                    </div>
                  ))}
                  <form onSubmit={handleAddCollaborator} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newCollaborator}
                      onChange={(e) => setNewCollaborator(e.target.value)}
                      placeholder="Invite someone..."
                      className={`bg-transparent border-none focus:ring-0 p-0 text-xs font-normal ${isOverdue ? 'text-rose-800 placeholder-rose-300' : 'text-slate-600 placeholder-slate-300'
                        }`}
                    />
                    {newCollaborator && (
                      <button type="submit" className={`text-[10px] font-bold uppercase ${isOverdue ? 'text-rose-600' : 'text-indigo-600'}`}>
                        Invite
                      </button>
                    )}
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
