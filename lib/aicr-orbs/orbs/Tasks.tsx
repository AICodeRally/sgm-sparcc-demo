'use client';

import { useState, useEffect } from 'react';

interface Task {
  id: string;
  title: string;
  status: 'pending' | 'in_progress' | 'blocked' | 'completed';
  priority: 'high' | 'medium' | 'low';
  assignee?: string;
}

interface TasksOrbProps {
  endpoint?: string;
}

export function TasksOrb({ endpoint = '/api/tasks' }: TasksOrbProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'in_progress' | 'blocked'>('all');

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await fetch(endpoint);
        const data = await res.json();
        setTasks(data.tasks ?? data ?? []);
      } catch {
        // Handle error silently
      } finally {
        setIsLoading(false);
      }
    };
    fetchTasks();
  }, [endpoint]);

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'all') return task.status !== 'completed';
    return task.status === filter;
  });

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'pending': return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
      case 'in_progress': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
      case 'blocked': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
      case 'completed': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
    }
  };

  if (isLoading) {
    return <div className="p-4 text-gray-500 text-sm">Loading tasks...</div>;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Filter tabs */}
      <div className="flex gap-1 p-2 border-b border-gray-200 dark:border-gray-700">
        {(['all', 'pending', 'in_progress', 'blocked'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-2 py-1 text-xs rounded-lg transition-colors ${
              filter === f
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            {f.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Task list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {filteredTasks.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-sm">No tasks</p>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
            >
              <div className="flex items-start justify-between">
                <h4 className="font-medium text-sm text-gray-900 dark:text-white">{task.title}</h4>
                <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(task.status)}`}>
                  {task.status.replace('_', ' ')}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
