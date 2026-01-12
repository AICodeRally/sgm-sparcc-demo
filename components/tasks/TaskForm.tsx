'use client';

import { useState } from 'react';
import { Cross2Icon } from '@radix-ui/react-icons';
import { createTask, updateTask, STATUS_CONFIG, PRIORITY_CONFIG } from '@/lib/tasks/task-service';
import type { Task, TaskStatus, TaskPriority, CreateTaskInput, UpdateTaskInput } from '@/lib/tasks/task-service';

interface TaskFormProps {
  task?: Task;
  onSave: () => void;
  onCancel: () => void;
}

export function TaskForm({ task, onSave, onCancel }: TaskFormProps) {
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [status, setStatus] = useState<TaskStatus>(task?.status || 'ready');
  const [priority, setPriority] = useState<TaskPriority>(task?.priority || 'medium');
  const [category, setCategory] = useState(task?.category || '');
  const [estimate, setEstimate] = useState(task?.estimate || '');
  const [labels, setLabels] = useState(task?.labels?.join(', ') || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!task;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const labelArray = labels.split(',').map(l => l.trim()).filter(Boolean);

    if (isEditing) {
      const input: UpdateTaskInput = {
        title: title.trim(),
        description: description.trim() || undefined,
        status,
        priority,
        category: category.trim() || undefined,
        estimate: estimate.trim() || undefined,
        labels: labelArray.length > 0 ? labelArray : undefined,
      };
      const result = await updateTask(task.id, input);
      if (result) {
        onSave();
      } else {
        setError('Failed to update task');
      }
    } else {
      const input: CreateTaskInput = {
        title: title.trim(),
        description: description.trim() || undefined,
        status,
        priority,
        category: category.trim() || undefined,
        estimate: estimate.trim() || undefined,
        labels: labelArray.length > 0 ? labelArray : undefined,
      };
      const result = await createTask(input);
      if (result) {
        onSave();
      } else {
        setError('Failed to create task');
      }
    }

    setIsSubmitting(false);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-[color:var(--color-foreground)]">
          {isEditing ? 'Edit Task' : 'New Task'}
        </h2>
        <button onClick={onCancel} className="p-1 rounded hover:bg-[color:var(--color-surface-alt)]">
          <Cross2Icon className="w-5 h-5 text-[color:var(--color-muted)]" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-[color:var(--color-foreground)] mb-1">Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-[color:var(--color-border)] focus:border-[color:var(--color-primary)] focus:ring-1 focus:ring-[color:var(--color-info-border)]"
            placeholder="Task title"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-[color:var(--color-foreground)] mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 rounded-lg border border-[color:var(--color-border)] focus:border-[color:var(--color-primary)] focus:ring-1 focus:ring-[color:var(--color-info-border)]"
            placeholder="Task description"
          />
        </div>

        {/* Status & Priority */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[color:var(--color-foreground)] mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
              className="w-full px-3 py-2 rounded-lg border border-[color:var(--color-border)]"
            >
              {(Object.keys(STATUS_CONFIG) as TaskStatus[]).map((s) => (
                <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[color:var(--color-foreground)] mb-1">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
              className="w-full px-3 py-2 rounded-lg border border-[color:var(--color-border)]"
            >
              {(Object.keys(PRIORITY_CONFIG) as TaskPriority[]).map((p) => (
                <option key={p} value={p}>{PRIORITY_CONFIG[p].label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Category & Estimate */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[color:var(--color-foreground)] mb-1">Category</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[color:var(--color-border)]"
              placeholder="e.g., feature, bug, docs"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[color:var(--color-foreground)] mb-1">Estimate</label>
            <input
              type="text"
              value={estimate}
              onChange={(e) => setEstimate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[color:var(--color-border)]"
              placeholder="e.g., 2h, 1d, 1w"
            />
          </div>
        </div>

        {/* Labels */}
        <div>
          <label className="block text-sm font-medium text-[color:var(--color-foreground)] mb-1">Labels</label>
          <input
            type="text"
            value={labels}
            onChange={(e) => setLabels(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-[color:var(--color-border)]"
            placeholder="Comma-separated labels"
          />
        </div>

        {/* Error */}
        {error && (
          <div className="p-3 rounded-lg bg-[color:var(--color-error-bg)] border border-[color:var(--color-error-border)] text-sm text-[color:var(--color-error)]">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-[color:var(--color-border)] text-sm font-medium hover:bg-[color:var(--color-surface-alt)]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 rounded-lg bg-[color:var(--color-primary)] text-white text-sm font-medium hover:bg-[color:var(--color-secondary)] disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Task'}
          </button>
        </div>
      </form>
    </div>
  );
}
