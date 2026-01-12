/**
 * Task Service
 *
 * Manages tasks via AICR Platform Task API
 */

const AICR_API_BASE = process.env.NEXT_PUBLIC_AICR_API_BASE || 'https://app.aicoderally.com';
const TENANT_ID = 'sgm-sparcc';

export type TaskStatus = 'backlog' | 'ready' | 'in_progress' | 'review' | 'blocked' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';
export type AssigneeType = 'person' | 'agent';

export interface Task {
  id: string;
  tenantId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  category?: string;
  assigneeType?: AssigneeType;
  assigneeId?: string;
  labels: string[];
  estimate?: string;
  dueDate?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  _count?: { comments: number };
}

export interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeId?: string;
  category?: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  category?: string;
  assigneeType?: AssigneeType;
  assigneeId?: string;
  labels?: string[];
  estimate?: string;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  category?: string;
  assigneeType?: AssigneeType;
  assigneeId?: string;
  labels?: string[];
  estimate?: string;
}

export interface TasksResponse {
  tasks: Task[];
}

/**
 * Fetch tasks from AICR Platform
 */
export async function getTasks(filters?: TaskFilters): Promise<Task[]> {
  try {
    const params = new URLSearchParams();
    if (filters?.status) params.set('status', filters.status);
    if (filters?.priority) params.set('priority', filters.priority);
    if (filters?.assigneeId) params.set('assigneeId', filters.assigneeId);
    if (filters?.category) params.set('category', filters.category);

    const url = `${AICR_API_BASE}/api/tasks${params.toString() ? `?${params}` : ''}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-tenant-id': TENANT_ID,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error('Task API error:', response.status, response.statusText);
      return [];
    }

    const data: TasksResponse = await response.json();
    return data.tasks;
  } catch (error) {
    console.error('Failed to fetch tasks:', error);
    return [];
  }
}

/**
 * Get a single task
 */
export async function getTask(taskId: string): Promise<Task | null> {
  try {
    const response = await fetch(`${AICR_API_BASE}/api/tasks/${taskId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-tenant-id': TENANT_ID,
      },
      cache: 'no-store',
    });

    if (!response.ok) return null;

    const data = await response.json();
    return data.task;
  } catch (error) {
    console.error('Failed to fetch task:', error);
    return null;
  }
}

/**
 * Create a new task
 */
export async function createTask(input: CreateTaskInput): Promise<Task | null> {
  try {
    const response = await fetch(`${AICR_API_BASE}/api/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-tenant-id': TENANT_ID,
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      console.error('Failed to create task:', response.status);
      return null;
    }

    const data = await response.json();
    return data.task;
  } catch (error) {
    console.error('Failed to create task:', error);
    return null;
  }
}

/**
 * Update a task
 */
export async function updateTask(taskId: string, input: UpdateTaskInput): Promise<Task | null> {
  try {
    const response = await fetch(`${AICR_API_BASE}/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-tenant-id': TENANT_ID,
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      console.error('Failed to update task:', response.status);
      return null;
    }

    const data = await response.json();
    return data.task;
  } catch (error) {
    console.error('Failed to update task:', error);
    return null;
  }
}

/**
 * Delete a task
 */
export async function deleteTask(taskId: string): Promise<boolean> {
  try {
    const response = await fetch(`${AICR_API_BASE}/api/tasks/${taskId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'x-tenant-id': TENANT_ID,
      },
    });

    return response.ok;
  } catch (error) {
    console.error('Failed to delete task:', error);
    return false;
  }
}

/**
 * Update task status (convenience method)
 */
export async function updateTaskStatus(taskId: string, status: TaskStatus): Promise<Task | null> {
  return updateTask(taskId, { status });
}

// Status display configuration
export const STATUS_CONFIG: Record<TaskStatus, { label: string; color: string; bgClass: string }> = {
  backlog: { label: 'Backlog', color: 'text-gray-600', bgClass: 'bg-gray-100' },
  ready: { label: 'Ready', color: 'text-blue-600', bgClass: 'bg-blue-100' },
  in_progress: { label: 'In Progress', color: 'text-yellow-600', bgClass: 'bg-yellow-100' },
  review: { label: 'Review', color: 'text-purple-600', bgClass: 'bg-purple-100' },
  blocked: { label: 'Blocked', color: 'text-red-600', bgClass: 'bg-red-100' },
  done: { label: 'Done', color: 'text-green-600', bgClass: 'bg-green-100' },
};

export const PRIORITY_CONFIG: Record<TaskPriority, { label: string; color: string; bgClass: string }> = {
  low: { label: 'Low', color: 'text-gray-600', bgClass: 'bg-gray-100' },
  medium: { label: 'Medium', color: 'text-blue-600', bgClass: 'bg-blue-100' },
  high: { label: 'High', color: 'text-orange-600', bgClass: 'bg-orange-100' },
  critical: { label: 'Critical', color: 'text-red-600', bgClass: 'bg-red-100' },
};
