'use client';

import { useState, useEffect } from 'react';
import { TaskCard } from './TaskCard';
import { TaskForm } from './TaskForm';
import { getTasks, STATUS_CONFIG, PRIORITY_CONFIG } from '@/lib/tasks/task-service';
import type { Task, TaskStatus, TaskPriority } from '@/lib/tasks/task-service';
import { ReloadIcon, PlusIcon } from '@radix-ui/react-icons';

interface TaskListProps {
  initialStatus?: TaskStatus;
}

export function TaskList({ initialStatus }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>(initialStatus || 'all');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const loadTasks = async () => {
    setIsLoading(true);
    const filters: Record<string, string> = {};
    if (statusFilter !== 'all') filters.status = statusFilter;
    if (priorityFilter !== 'all') filters.priority = priorityFilter;

    const data = await getTasks(Object.keys(filters).length > 0 ? filters as any : undefined);
    setTasks(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadTasks();
  }, [statusFilter, priorityFilter]);

  const handleTaskCreated = () => {
    setShowForm(false);
    setEditingTask(null);
    loadTasks();
  };

  const filteredTasks = tasks;

  // Group by status for display
  const tasksByStatus = tasks.reduce((acc, task) => {
    if (!acc[task.status]) acc[task.status] = [];
    acc[task.status].push(task);
    return acc;
  }, {} as Record<TaskStatus, Task[]>);

  if (isLoading && tasks.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-2 text-[color:var(--color-muted)]">
          <ReloadIcon className="w-5 h-5 animate-spin" />
          <span>Loading tasks...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between gap-4 p-4 bg-[color:var(--color-surface)] rounded-lg border border-[color:var(--color-border)] flex-wrap">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-[color:var(--color-foreground)]">Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as TaskStatus | 'all')}
              className="px-3 py-1.5 rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] text-sm"
            >
              <option value="all">All</option>
              {(Object.keys(STATUS_CONFIG) as TaskStatus[]).map((status) => (
                <option key={status} value={status}>{STATUS_CONFIG[status].label}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-[color:var(--color-foreground)]">Priority:</label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as TaskPriority | 'all')}
              className="px-3 py-1.5 rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] text-sm"
            >
              <option value="all">All</option>
              {(Object.keys(PRIORITY_CONFIG) as TaskPriority[]).map((priority) => (
                <option key={priority} value={priority}>{PRIORITY_CONFIG[priority].label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadTasks}
            disabled={isLoading}
            className="px-4 py-1.5 rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] hover:bg-[color:var(--color-surface-alt)] transition-colors disabled:opacity-50 flex items-center gap-2 text-sm"
          >
            <ReloadIcon className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-1.5 rounded-lg bg-[color:var(--color-primary)] text-white hover:bg-[color:var(--color-secondary)] transition-colors flex items-center gap-2 text-sm font-medium"
          >
            <PlusIcon className="w-4 h-4" />
            New Task
          </button>
        </div>
      </div>

      {/* Task Form Modal */}
      {(showForm || editingTask) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-[color:var(--color-surface)] rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <TaskForm
              task={editingTask || undefined}
              onSave={handleTaskCreated}
              onCancel={() => { setShowForm(false); setEditingTask(null); }}
            />
          </div>
        </div>
      )}

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <div className="text-center py-12 bg-[color:var(--color-surface)] rounded-lg border border-[color:var(--color-border)]">
          <p className="text-[color:var(--color-muted)]">No tasks found</p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-4 px-4 py-2 rounded-lg bg-[color:var(--color-primary)] text-white hover:bg-[color:var(--color-secondary)] transition-colors text-sm font-medium"
          >
            Create your first task
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onUpdate={loadTasks}
              onEdit={(t) => setEditingTask(t)}
            />
          ))}
        </div>
      )}

      {/* Stats */}
      {tasks.length > 0 && (
        <div className="text-center text-xs text-[color:var(--color-muted)] py-2">
          {tasks.length} total tasks | {tasks.filter(t => t.status === 'done').length} completed
        </div>
      )}
    </div>
  );
}
