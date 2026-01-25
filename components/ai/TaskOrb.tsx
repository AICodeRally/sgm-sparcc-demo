'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  ListBulletIcon,
  Cross2Icon,
  ReloadIcon,
  CrossCircledIcon,
  CheckCircledIcon,
  ExclamationTriangleIcon,
} from '@radix-ui/react-icons';
import { getTasks, STATUS_CONFIG, PRIORITY_CONFIG } from '@/lib/tasks/task-service';
import type { Task } from '@/lib/tasks/task-service';

interface TaskOrbProps {
  enabled?: boolean;
}

export function TaskOrb({ enabled = true }: TaskOrbProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [failureCount, setFailureCount] = useState(0);

  const loadTasks = useCallback(async () => {
    setIsLoading(true);
    const data = await getTasks();

    // Check for offline marker
    if (data.length === 1 && data[0].id === '__offline__') {
      const newCount = failureCount + 1;
      setFailureCount(newCount);
      if (newCount >= 2) {
        setIsOffline(true);
      }
      setTasks([]);
    } else {
      setFailureCount(0);
      setIsOffline(false);
      // Show non-done tasks
      const activeTasks = data.filter(t => t.status !== 'done');
      setTasks(activeTasks);
    }
    setIsLoading(false);
  }, [failureCount]);

  useEffect(() => {
    if (isOpen && tasks.length === 0 && !isOffline) {
      loadTasks();
    }
  }, [isOpen]);

  if (!enabled) return null;

  const stats = {
    total: tasks.length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    blocked: tasks.filter(t => t.status === 'blocked').length,
    highPriority: tasks.filter(t => t.priority === 'high' || t.priority === 'critical').length,
  };

  const activeCount = stats.inProgress + stats.blocked;

  return (
    <>
      {/* Floating Orb - Right side, next to AskItem */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-20 z-40 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg transition-all hover:scale-110 hover:shadow-xl group"
        style={{ backgroundColor: 'var(--sparcc-gradient-end)' }}
        aria-label="Open Tasks"
        title="Tasks - Governance Task Management"
      >
        <ListBulletIcon className="h-6 w-6" />
        {/* Pulse glow on hover */}
        <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-30 transition-opacity blur-lg -z-10" style={{ backgroundColor: 'var(--sparcc-gradient-end)' }} />
        {/* Active count badge */}
        {activeCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[color:var(--color-warning)] text-xs font-bold text-white">
            {activeCount}
          </span>
        )}
        {/* Blocked indicator */}
        {stats.blocked > 0 && (
          <span className="absolute -left-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[color:var(--color-error)]">
            <ExclamationTriangleIcon className="h-3 w-3 text-white" />
          </span>
        )}
        {/* Offline indicator */}
        {isOffline && (
          <span className="absolute -right-1 -bottom-1 flex h-4 w-4 items-center justify-center rounded-full bg-[color:var(--color-muted)]">
            <CrossCircledIcon className="h-3 w-3 text-white" />
          </span>
        )}
      </button>

      {/* Panel */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative w-full max-w-2xl max-h-[80vh] flex flex-col rounded-lg bg-[color:var(--color-surface)] shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[color:var(--color-border)] p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: 'var(--sparcc-gradient-end)' }}>
                  <ListBulletIcon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-[color:var(--color-foreground)]">Tasks</h2>
                  <p className="text-sm text-[color:var(--color-muted)]">Governance Task Management</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={"/tasks" as any}
                  onClick={() => setIsOpen(false)}
                  className="text-sm text-[color:var(--color-info)] hover:underline mr-2"
                >
                  View All
                </Link>
                <button
                  onClick={() => { setFailureCount(0); setIsOffline(false); loadTasks(); }}
                  disabled={isLoading}
                  className="rounded-lg p-2 text-[color:var(--color-muted)] transition-colors hover:bg-[color:var(--color-surface-alt)] disabled:opacity-50"
                  title="Refresh"
                >
                  <ReloadIcon className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg p-2 text-[color:var(--color-muted)] transition-colors hover:bg-[color:var(--color-surface-alt)]"
                >
                  <Cross2Icon className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Stats Bar */}
            <div className="border-b border-[color:var(--color-border)] bg-[color:var(--color-surface-alt)] px-4 py-3">
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-[color:var(--color-muted)]">Active:</span>
                  <span className="font-semibold text-[color:var(--color-foreground)]">{stats.total}</span>
                </div>
                <div className="flex items-center gap-2 text-[color:var(--color-warning)]">
                  <span>In Progress:</span>
                  <span className="font-semibold">{stats.inProgress}</span>
                </div>
                <div className="flex items-center gap-2 text-[color:var(--color-error)]">
                  <ExclamationTriangleIcon className="h-4 w-4" />
                  <span>Blocked:</span>
                  <span className="font-semibold">{stats.blocked}</span>
                </div>
                <div className="flex items-center gap-2 text-[color:var(--color-accent)]">
                  <span>High Priority:</span>
                  <span className="font-semibold">{stats.highPriority}</span>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {isOffline ? (
                <div className="text-center py-12">
                  <CrossCircledIcon className="w-12 h-12 mx-auto mb-3 text-[color:var(--color-muted)] opacity-50" />
                  <p className="text-[color:var(--color-muted)]">Service Offline</p>
                  <button
                    onClick={() => { setFailureCount(0); setIsOffline(false); loadTasks(); }}
                    className="mt-3 text-sm text-[color:var(--color-info)] hover:underline"
                  >
                    Retry connection
                  </button>
                </div>
              ) : isLoading && tasks.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <ReloadIcon className="h-8 w-8 animate-spin" style={{ color: 'var(--sparcc-gradient-end)' }} />
                  <span className="ml-3 text-[color:var(--color-muted)]">Loading tasks...</span>
                </div>
              ) : tasks.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircledIcon className="w-12 h-12 mx-auto mb-3 text-[color:var(--color-success)]" />
                  <p className="text-[color:var(--color-muted)]">All tasks completed!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {tasks.slice(0, 10).map((task) => (
                    <div
                      key={task.id}
                      className="rounded-lg bg-[color:var(--color-surface-alt)] p-4 border border-[color:var(--color-border)] hover:border-[color:var(--color-primary)] transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-[color:var(--color-foreground)] truncate">{task.title}</h4>
                          {task.description && (
                            <p className="mt-1 text-sm text-[color:var(--color-muted)] line-clamp-2">{task.description}</p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <span className={`px-2 py-0.5 rounded text-xs ${STATUS_CONFIG[task.status].bgClass} ${STATUS_CONFIG[task.status].color}`}>
                              {STATUS_CONFIG[task.status].label}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-xs ${PRIORITY_CONFIG[task.priority].bgClass} ${PRIORITY_CONFIG[task.priority].color}`}>
                              {PRIORITY_CONFIG[task.priority].label}
                            </span>
                            {task.category && (
                              <span className="px-2 py-0.5 rounded text-xs bg-[color:var(--color-surface)] text-[color:var(--color-muted)] border border-[color:var(--color-border)]">
                                {task.category}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {tasks.length > 10 && (
                    <p className="text-center text-sm text-[color:var(--color-muted)]">
                      +{tasks.length - 10} more tasks
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-[color:var(--color-border)] bg-[color:var(--color-surface-alt)] px-4 py-3 text-xs text-[color:var(--color-muted)] flex items-center gap-2">
              <ListBulletIcon className="h-4 w-4" />
              <span>Tasks synced from AICR Platform. View all tasks for full management.</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
