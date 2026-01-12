'use client';

import { TaskList } from '@/components/tasks/TaskList';

export default function TasksPage() {
  return (
    <div className="min-h-screen bg-[color:var(--color-surface-alt)]">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[color:var(--color-foreground)] mb-2">Tasks</h1>
          <p className="text-[color:var(--color-muted)]">
            Manage and track tasks across your governance workflow
          </p>
        </div>

        <TaskList />
      </div>
    </div>
  );
}
