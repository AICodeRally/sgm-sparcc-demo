'use client';

import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { SetPageTitle } from '@/components/SetPageTitle';
import { Breadcrumb } from '@/components/Breadcrumb';
import {
  PersonIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  Pencil1Icon,
  TrashIcon,
  Cross2Icon,
  CheckIcon,
} from '@radix-ui/react-icons';

interface User {
  id: string;
  name: string | null;
  email: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'USER' | 'VIEWER';
  tenantId: string;
  createdAt: string;
  tenant: {
    name: string;
    slug: string;
  };
}

interface Tenant {
  id: string;
  name: string;
  slug: string;
}

interface Stats {
  total: number;
  byRole: Record<string, number>;
}

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Admin',
  MANAGER: 'Manager',
  USER: 'User',
  VIEWER: 'Viewer',
};

const ROLE_COLORS: Record<string, string> = {
  SUPER_ADMIN: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  ADMIN: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  MANAGER: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  USER: 'bg-gray-100 text-gray-800 dark:bg-gray-700/50 dark:text-gray-300',
  VIEWER: 'bg-slate-100 text-slate-600 dark:bg-slate-700/50 dark:text-slate-400',
};

export default function UsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tenantFilter = searchParams.get('tenantId');

  const [users, setUsers] = useState<User[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, byRole: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedTenant, setSelectedTenant] = useState<string>(tenantFilter || '');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'USER' as User['role'],
    tenantId: '',
  });
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const userRole = (session as any)?.user?.role;
  const isSuperAdmin = userRole === 'SUPER_ADMIN';

  const fetchUsers = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (selectedTenant) params.set('tenantId', selectedTenant);
      if (search) params.set('search', search);

      const res = await fetch(`/api/admin/users?${params}`);
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      setUsers(data.users);
      setStats(data.stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [selectedTenant, search]);

  const fetchTenants = useCallback(async () => {
    if (!isSuperAdmin) return;
    try {
      const res = await fetch('/api/admin/tenants');
      if (!res.ok) return;
      const data = await res.json();
      setTenants(data);
    } catch {
      // Ignore tenant fetch errors
    }
  }, [isSuperAdmin]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (session && userRole !== 'SUPER_ADMIN' && userRole !== 'ADMIN') {
      router.push('/');
      return;
    }

    if (status === 'authenticated') {
      fetchUsers();
      fetchTenants();
    }
  }, [status, session, router, userRole, fetchUsers, fetchTenants]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (status === 'authenticated') {
        fetchUsers();
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [search, selectedTenant, status, fetchUsers]);

  const openCreateModal = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      role: 'USER',
      tenantId: selectedTenant || (tenants[0]?.id ?? ''),
    });
    setShowModal(true);
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name || '',
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setFormData({ name: '', email: '', role: 'USER', tenantId: '' });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const url = editingUser ? `/api/admin/users/${editingUser.id}` : '/api/admin/users';
      const method = editingUser ? 'PATCH' : 'POST';

      const payload = editingUser
        ? { name: formData.name, role: formData.role, tenantId: formData.tenantId }
        : formData;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save user');
      }

      closeModal();
      fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (userId: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete user');
      }
      setDeleteConfirm(null);
      fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[color:var(--color-muted)]">Loading users...</p>
      </div>
    );
  }

  return (
    <>
      <SetPageTitle title="User Management" description="Manage users and role assignments" />
      <div className="min-h-screen bg-[color:var(--color-surface-alt)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Breadcrumb
            items={[
              { label: 'Settings', href: '/settings' },
              { label: 'User Management' },
            ]}
          />

          {/* Header */}
          <div className="flex items-center justify-between mt-6 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-[color:var(--color-foreground)]">
                User Management
              </h1>
              <p className="mt-2 text-sm text-[color:var(--color-muted)]">
                {isSuperAdmin ? 'Manage all users across tenants' : 'Manage users in your organization'}
              </p>
            </div>
            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 px-4 py-2 bg-[linear-gradient(90deg,var(--sparcc-gradient-start),var(--sparcc-gradient-mid2),var(--sparcc-gradient-end))] text-white rounded-md hover:opacity-90 transition-all"
            >
              <PlusIcon className="h-4 w-4" />
              Add User
            </button>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-[color:var(--color-error-bg)] border border-[color:var(--color-error-border)]">
              <p className="text-[color:var(--color-error)]">{error}</p>
              <button
                onClick={() => setError(null)}
                className="mt-2 text-sm underline text-[color:var(--color-error)]"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
            <div className="bg-[color:var(--color-surface)] rounded-lg shadow p-4">
              <p className="text-xs text-[color:var(--color-muted)]">Total Users</p>
              <p className="text-2xl font-bold text-[color:var(--color-foreground)] mt-1">
                {stats.total}
              </p>
            </div>
            {Object.entries(ROLE_LABELS).map(([role, label]) => (
              <div key={role} className="bg-[color:var(--color-surface)] rounded-lg shadow p-4">
                <p className="text-xs text-[color:var(--color-muted)]">{label}</p>
                <p className="text-2xl font-bold text-[color:var(--color-foreground)] mt-1">
                  {stats.byRole[role] || 0}
                </p>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[color:var(--color-muted)]" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-[color:var(--color-border)] rounded-lg bg-[color:var(--color-surface)] text-[color:var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)]"
              />
            </div>
            {isSuperAdmin && tenants.length > 0 && (
              <select
                value={selectedTenant}
                onChange={(e) => setSelectedTenant(e.target.value)}
                className="px-4 py-2 border border-[color:var(--color-border)] rounded-lg bg-[color:var(--color-surface)] text-[color:var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)]"
              >
                <option value="">All Tenants</option>
                {tenants.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Users Table */}
          <div className="bg-[color:var(--color-surface)] rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-[color:var(--color-border)]">
              <thead className="bg-[color:var(--color-surface-alt)]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[color:var(--color-muted)] uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[color:var(--color-muted)] uppercase tracking-wider">
                    Role
                  </th>
                  {isSuperAdmin && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-[color:var(--color-muted)] uppercase tracking-wider">
                      Tenant
                    </th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-[color:var(--color-muted)] uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-[color:var(--color-muted)] uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[color:var(--color-border)]">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-[color:var(--color-surface-alt)]">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-[color:var(--color-surface-alt)] flex items-center justify-center">
                          <PersonIcon className="h-5 w-5 text-[color:var(--color-muted)]" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-[color:var(--color-foreground)]">
                            {user.name || 'No name'}
                          </div>
                          <div className="text-sm text-[color:var(--color-muted)]">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${ROLE_COLORS[user.role]}`}>
                        {ROLE_LABELS[user.role]}
                      </span>
                    </td>
                    {isSuperAdmin && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-[color:var(--color-foreground)]">
                          {user.tenant.name}
                        </div>
                        <div className="text-xs text-[color:var(--color-muted)]">{user.tenant.slug}</div>
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[color:var(--color-muted)]">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {deleteConfirm === user.id ? (
                        <div className="flex items-center justify-end gap-2">
                          <span className="text-xs text-[color:var(--color-muted)]">Delete?</span>
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="p-1 text-[color:var(--color-error)] hover:bg-[color:var(--color-error-bg)] rounded"
                          >
                            <CheckIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="p-1 text-[color:var(--color-muted)] hover:bg-[color:var(--color-surface-alt)] rounded"
                          >
                            <Cross2Icon className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(user)}
                            className="p-2 text-[color:var(--color-primary)] hover:bg-[color:var(--color-surface-alt)] rounded"
                            title="Edit user"
                          >
                            <Pencil1Icon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(user.id)}
                            className="p-2 text-[color:var(--color-error)] hover:bg-[color:var(--color-error-bg)] rounded"
                            title="Delete user"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {users.length === 0 && (
              <div className="text-center py-12">
                <PersonIcon className="h-12 w-12 mx-auto text-[color:var(--color-muted)] mb-4" />
                <p className="text-[color:var(--color-muted)]">No users found</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[color:var(--color-surface)] rounded-xl shadow-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-6 border-b border-[color:var(--color-border)]">
              <h2 className="text-lg font-semibold text-[color:var(--color-foreground)]">
                {editingUser ? 'Edit User' : 'Add New User'}
              </h2>
              <button
                onClick={closeModal}
                className="p-1 hover:bg-[color:var(--color-surface-alt)] rounded"
              >
                <Cross2Icon className="h-5 w-5 text-[color:var(--color-muted)]" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[color:var(--color-foreground)] mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-[color:var(--color-border)] rounded-lg bg-[color:var(--color-surface)] text-[color:var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)]"
                  placeholder="John Doe"
                />
              </div>

              {!editingUser && (
                <div>
                  <label className="block text-sm font-medium text-[color:var(--color-foreground)] mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-[color:var(--color-border)] rounded-lg bg-[color:var(--color-surface)] text-[color:var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)]"
                    placeholder="john@example.com"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-[color:var(--color-foreground)] mb-1">
                  Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as User['role'] })}
                  className="w-full px-3 py-2 border border-[color:var(--color-border)] rounded-lg bg-[color:var(--color-surface)] text-[color:var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)]"
                >
                  {isSuperAdmin && <option value="SUPER_ADMIN">Super Admin</option>}
                  <option value="ADMIN">Admin</option>
                  <option value="MANAGER">Manager</option>
                  <option value="USER">User</option>
                  <option value="VIEWER">Viewer</option>
                </select>
              </div>

              {isSuperAdmin && tenants.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-[color:var(--color-foreground)] mb-1">
                    Tenant
                  </label>
                  <select
                    value={formData.tenantId}
                    onChange={(e) => setFormData({ ...formData, tenantId: e.target.value })}
                    className="w-full px-3 py-2 border border-[color:var(--color-border)] rounded-lg bg-[color:var(--color-surface)] text-[color:var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)]"
                  >
                    <option value="">Select tenant...</option>
                    {tenants.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 p-6 border-t border-[color:var(--color-border)]">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-sm text-[color:var(--color-muted)] hover:bg-[color:var(--color-surface-alt)] rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !formData.name || (!editingUser && !formData.email)}
                className="px-4 py-2 text-sm bg-[color:var(--color-primary)] text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : editingUser ? 'Save Changes' : 'Create User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
