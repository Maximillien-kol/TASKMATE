'use client';

import React, { useEffect, useState } from 'react';
import { tasksService } from '@/services/tasksService';
import { Todo } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

export const AchievementsView = () => {
    const { user } = useAuth();
    const [tasks, setTasks] = useState<Todo[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const fetchedTasks = await tasksService.getUserTasks();
                setTasks(fetchedTasks);
            } catch (error) {
                console.error('Failed to fetch tasks for achievements:', error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    // --- Stats Calculation ---

    const completedTasks = tasks.filter(t => t.completed);

    // 1. Calculate Streak
    // Logic: Consecutive days ending today (or yesterday) with at least one completed task.
    // We use Set of date strings (YYYY-MM-DD) to handle multiple tasks per day.
    const getStreak = () => {
        // Get all unique completed dates, sorted desc
        const dates = Array.from(new Set(
            completedTasks
                .filter(t => t.completedAt)
                .map(t => new Date(t.completedAt!).toISOString().split('T')[0])
        )).sort((a, b) => b.localeCompare(a)); // Descending

        if (dates.length === 0) return 0;

        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

        // If no task today or yesterday, streak is broken (0). 
        // Unless we want to be lenient and say streak persists until you miss a day? 
        // Strict streak: Must have done something today or yesterday.
        if (dates[0] !== today && dates[0] !== yesterday) {
            return 0;
        }

        let currentStreak = 1;
        let lastDate = new Date(dates[0]);

        for (let i = 1; i < dates.length; i++) {
            const thisDate = new Date(dates[i]);
            const diffTime = Math.abs(lastDate.getTime() - thisDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
                currentStreak++;
                lastDate = thisDate;
            } else {
                break;
            }
        }
        return currentStreak;
    };

    const streak = getStreak();

    // 2. Weekly Calendar Data
    const getWeekData = () => {
        const days = [];
        const today = new Date();
        // Start from 6 days ago
        for (let i = 6; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];

            // Check if any task completed this day
            const isCompleted = completedTasks.some(t =>
                t.completedAt && new Date(t.completedAt).toISOString().split('T')[0] === dateStr
            );

            days.push({
                label: d.toLocaleDateString('en-US', { weekday: 'narrow' }),
                date: d.getDate(),
                completed: isCompleted,
                isToday: i === 0
            });
        }
        return days;
    };
    const weekDays = getWeekData();

    // 3. Stats Grid
    const uniqueActiveDays = new Set(
        completedTasks.map(t => t.completedAt ? new Date(t.completedAt).toISOString().split('T')[0] : null).filter(Boolean)
    ).size;

    const completionRate = tasks.length > 0
        ? Math.round((completedTasks.length / tasks.length) * 100)
        : 0;

    const stats = [
        { label: 'Active Days', value: uniqueActiveDays },
        { label: 'Completed', value: completedTasks.length },
        { label: 'Created', value: tasks.length },
        { label: 'Completion', value: `${completionRate}%` },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    const userName = user?.user_metadata?.full_name?.split(' ')[0] || 'User';

    return (
        <div className="space-y-6">
            {/* Main Streak Card */}
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-[0_2px_40px_-12px_rgba(0,0,0,0.1)] p-8 text-center relative group">
                {/* Background decorative elements - Emerald Theme */}
                <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-emerald-50/50 to-transparent pointer-events-none transition-opacity duration-700 opacity-60 group-hover:opacity-100"></div>

                <div className="relative z-10">
                    {/* Flame Icon */}
                    <div className="w-24 h-24 mx-auto mb-6 relative">
                        <div className="absolute inset-0 bg-emerald-500 rounded-full opacity-20 blur-xl animate-pulse"></div>
                        <div className="relative bg-gradient-to-br from-emerald-400 to-teal-600 rounded-full p-6 shadow-xl w-full h-full flex items-center justify-center text-white ring-4 ring-white">
                            <i className="fas fa-fire text-5xl drop-shadow-md"></i>
                        </div>
                    </div>

                    <h1 className="text-6xl font-black text-slate-900 mb-2 tracking-tighter drop-shadow-sm">{streak}</h1>
                    <h2 className="text-xl font-bold text-slate-900 mb-2">Day Streak</h2>
                    <p className="text-slate-500 font-medium mb-10">
                        {streak > 0 ? `You are doing really great, ${userName}!` : `Start a streak today, ${userName}!`}
                    </p>

                    {/* Weekly Calendar */}
                    <div className="flex justify-between max-w-sm mx-auto mb-4">
                        {weekDays.map((day, index) => (
                            <div key={index} className="flex flex-col items-center gap-2">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{day.label}</span>
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${day.completed
                                        ? 'bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-md shadow-emerald-200 scale-100'
                                        : day.isToday
                                            ? 'bg-slate-900 text-white shadow-lg ring-4 ring-slate-100 scale-110'
                                            : 'bg-slate-50 text-slate-300'
                                    }`}>
                                    {day.completed ? (
                                        <i className="fas fa-check text-xs"></i>
                                    ) : (
                                        day.date
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
                <h3 className="text-center text-xs font-bold text-slate-400 uppercase tracking-widest mb-8">Overall Progress</h3>
                <div className="grid grid-cols-4 gap-4 text-center divide-x divide-slate-100">
                    {stats.map((stat, i) => (
                        <div key={i} className="px-2">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">{stat.label}</p>
                            <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{stat.value}</p>
                        </div>
                    ))}
                </div>

                {/* Insights Button / Placeholder */}
                <div className="mt-8 flex justify-center opacity-60 hover:opacity-100 transition-opacity cursor-not-allowed">
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-bold transition-colors">
                        <i className="fas fa-sparkles"></i>
                        AI Insights Available Soon
                    </button>
                </div>
            </div>
        </div>
    );
};
