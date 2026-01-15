'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRightIcon, ReloadIcon, CheckCircledIcon } from '@radix-ui/react-icons';
import { getTasks, STATUS_CONFIG, PRIORITY_CONFIG } from '@/lib/tasks/task-service';
import type { Task } from '@/lib/tasks/task-service';
import { getToneStyles } from '@/lib/config/themes';

export function TaskWidget({ tone = 'infra' as const }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const toneStyles = getToneStyles(tone);

  const loadTasks = async () => {
    setIsLoading(true);
    const data = await getTasks();
    // Show top 5 non-done tasks, prioritized by priority
    const activeTasks = data
      .filter(t => t.status !== 'done')
      .slice(0, 5);
    setTasks(activeTasks);
    setIsLoading(false);
  };

  useEffect(() => {
    loadTasks();
    const interval = setInterval(loadTasks, 120000); // Refresh every 2 minutes
    return () => clearInterval(interval);
  }, []);

  const stats = {
    total: tasks.length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    blocked: tasks.filter(t => t.status === 'blocked').length,
  };

  return (
    <div
      className="bg-[color:var(--color-surface)] rounded-lg border p-4 theme-card"
      style={{ border: toneStyles.border, boxShadow: toneStyles.shadow }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-[color:var(--color-foreground)]">Tasks</h3>
          <span className="text-[10px] px-2 py-0.5 rounded-full text-[color:var(--color-foreground)] border" style={{ borderColor: toneStyles.hover }}>
            Governance
          </span>
        </div>
        <Link
          href={"/tasks" as any}
          className="flex items-center gap-1 text-sm text-[color:var(--color-info)] hover:text-[color:var(--color-info)] font-medium"
        >
          View All
          <ArrowRightIcon className="w-4 h-4" />
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="text-center p-2 bg-[color:var(--color-surface-alt)] rounded">
          <div className="text-lg font-semibold text-[color:var(--color-foreground)]">{stats.total}</div>
          <div className="text-xs text-[color:var(--color-muted)]">Active</div>
        </div>
        <div className="text-center p-2 bg-[color:var(--color-warning-bg)] rounded">
          <div className="text-lg font-semibold text-[color:var(--color-warning)]">{stats.inProgress}</div>
          <div className="text-xs text-[color:var(--color-warning)]">In Progress</div>
        </div>
        <div className="text-center p-2 bg-[color:var(--color-error-bg)] rounded">
          <div className="text-lg font-semibold text-[color:var(--color-error)]">{stats.blocked}</div>
          <div className="text-xs text-[color:var(--color-error)]">Blocked</div>
        </div>
      </div>

      {isLoading && tasks.length === 0 ? (
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center gap-2 text-[color:var(--color-muted)]">
            <ReloadIcon className="w-4 h-4 animate-spin" />
            <span className="text-sm">Loading...</span>
          </div>
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-8">
          <CheckCircledIcon className="w-8 h-8 text-[color:var(--color-success)] mx-auto mb-2" />
          <p className="text-sm text-[color:var(--color-muted)]">All tasks completed!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="p-2 rounded border border-[color:var(--color-border)] hover:bg-[color:var(--color-surface-alt)] transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[color:var(--color-foreground)] truncate">{task.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-1.5 py-0.5 rounded text-xs ${STATUS_CONFIG[task.status].bgClass} ${STATUS_CONFIG[task.status].color}`}>
                      {STATUS_CONFIG[task.status].label}
                    </span>
                    <span className={`px-1.5 py-0.5 rounded text-xs ${PRIORITY_CONFIG[task.priority].bgClass} ${PRIORITY_CONFIG[task.priority].color}`}>
                      {PRIORITY_CONFIG[task.priority].label}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
