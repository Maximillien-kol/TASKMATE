import { useState, useEffect } from 'react';

interface TaskLimit {
    count: number;
    resetTime: number;
}

const TASK_LIMIT = 3;
const RESET_DURATION = 5 * 60 * 60 * 1000; // 5 hours in milliseconds

export function useTaskLimit() {
    const [taskLimit, setTaskLimit] = useState<TaskLimit>(() => {
        const saved = localStorage.getItem('taskLimit');
        if (saved) {
            const parsed = JSON.parse(saved);
            // Check if reset time has passed
            if (Date.now() >= parsed.resetTime) {
                return { count: 0, resetTime: Date.now() + RESET_DURATION };
            }
            return parsed;
        }
        return { count: 0, resetTime: Date.now() + RESET_DURATION };
    });

    useEffect(() => {
        localStorage.setItem('taskLimit', JSON.stringify(taskLimit));
    }, [taskLimit]);

    const canCreateTask = () => {
        // Check if reset time has passed
        if (Date.now() >= taskLimit.resetTime) {
            setTaskLimit({ count: 0, resetTime: Date.now() + RESET_DURATION });
            return true;
        }
        return taskLimit.count < TASK_LIMIT;
    };

    const incrementTaskCount = () => {
        setTaskLimit(prev => ({
            ...prev,
            count: prev.count + 1
        }));
    };

    const resetLimit = () => {
        setTaskLimit({ count: 0, resetTime: Date.now() + RESET_DURATION });
    };

    const getRemainingTasks = () => {
        if (Date.now() >= taskLimit.resetTime) {
            return TASK_LIMIT;
        }
        return TASK_LIMIT - taskLimit.count;
    };

    const getTimeUntilReset = () => {
        const remaining = taskLimit.resetTime - Date.now();
        if (remaining <= 0) return '0h 0m';

        const hours = Math.floor(remaining / (60 * 60 * 1000));
        const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
        return `${hours}h ${minutes}m`;
    };

    return {
        canCreateTask,
        incrementTaskCount,
        resetLimit,
        getRemainingTasks,
        getTimeUntilReset,
        taskLimit
    };
}
