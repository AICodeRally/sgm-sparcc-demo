'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

interface Tenant {
  id: string;
  name: string;
  slug: string;
  tier: 'DEMO' | 'BETA' | 'PRODUCTION';
  status: 'ACTIVE' | 'SUSPENDED' | 'TRIAL' | 'EXPIRED';
  createdAt: string;
  expiresAt: string | null;
  _count: {
    users: number;
    documents: number;
    policies: number;
    cases: number;
  };
}

export default function TenantsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (session && session.user.role !== 'SUPER_ADMIN') {
      router.push('/');
      return;
    }

    if (status === 'authenticated') {
      fetchTenants();
    }
  }, [status, session, router]);

  const fetchTenants = async () => {
    try {
      const res = await fetch('/api/admin/tenants');
      if (!res.ok) throw new Error('Failed to fetch tenants');
      const data = await res.json();
      setTenants(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const getTierBadge = (tier: string) => {
    const colors = {
      DEMO: 'bg-[color:var(--color-surface-alt)] text-[color:var(--color-foreground)]',
      BETA: 'bg-[color:var(--color-info-bg)] text-[color:var(--color-primary)]',
      PRODUCTION: 'bg-[color:var(--color-success-bg)] text-[color:var(--color-success)]',
    };
    return colors[tier as keyof typeof colors] || colors.DEMO;
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      ACTIVE: 'bg-[color:var(--color-success-bg)] text-[color:var(--color-success)]',
      SUSPENDED: 'bg-[color:var(--color-error-bg)] text-[color:var(--color-error)]',
      TRIAL: 'bg-[color:var(--color-warning-bg)] text-[color:var(--color-warning)]',
      EXPIRED: 'bg-[color:var(--color-surface-alt)] text-[color:var(--color-foreground)]',
    };
    return colors[status as keyof typeof colors] || colors.ACTIVE;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[color:var(--color-muted)]">Loading tenants...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-[color:var(--color-error-bg)] border border-[color:var(--color-error-border)] rounded-md p-4">
          <p className="text-[color:var(--color-error)]">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[color:var(--color-surface-alt)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[color:var(--color-foreground)]">Tenant Management</h1>
            <p className="mt-2 text-sm text-[color:var(--color-muted)]">
              Manage all tenants, users, and access controls
            </p>
          </div>
          <Link
            href="/admin/tenants/new"
            className="px-4 py-2 bg-[linear-gradient(90deg,var(--sparcc-gradient-start),var(--sparcc-gradient-mid2),var(--sparcc-gradient-end))] text-white rounded-md hover:opacity-90 transition-all"
          >
            + New Tenant
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-[color:var(--color-surface)] rounded-lg shadow p-6">
            <p className="text-sm text-[color:var(--color-muted)]">Total Tenants</p>
            <p className="text-3xl font-bold text-[color:var(--color-foreground)] mt-2">{tenants.length}</p>
          </div>
          <div className="bg-[color:var(--color-surface)] rounded-lg shadow p-6">
            <p className="text-sm text-[color:var(--color-muted)]">Active</p>
            <p className="text-3xl font-bold text-[color:var(--color-success)] mt-2">
              {tenants.filter((t) => t.status === 'ACTIVE').length}
            </p>
          </div>
          <div className="bg-[color:var(--color-surface)] rounded-lg shadow p-6">
            <p className="text-sm text-[color:var(--color-muted)]">Beta</p>
            <p className="text-3xl font-bold text-[color:var(--color-info)] mt-2">
              {tenants.filter((t) => t.tier === 'BETA').length}
            </p>
          </div>
          <div className="bg-[color:var(--color-surface)] rounded-lg shadow p-6">
            <p className="text-sm text-[color:var(--color-muted)]">Production</p>
            <p className="text-3xl font-bold text-[color:var(--color-primary)] mt-2">
              {tenants.filter((t) => t.tier === 'PRODUCTION').length}
            </p>
          </div>
        </div>

        {/* Tenants Table */}
        <div className="bg-[color:var(--color-surface)] rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-[color:var(--color-surface-alt)]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[color:var(--color-muted)] uppercase tracking-wider">
                  Tenant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[color:var(--color-muted)] uppercase tracking-wider">
                  Tier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[color:var(--color-muted)] uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[color:var(--color-muted)] uppercase tracking-wider">
                  Users
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[color:var(--color-muted)] uppercase tracking-wider">
                  Documents
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[color:var(--color-muted)] uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-[color:var(--color-muted)] uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-[color:var(--color-surface)] divide-y divide-gray-200">
              {tenants.map((tenant) => (
                <tr key={tenant.id} className="hover:bg-[color:var(--color-surface-alt)]">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-[color:var(--color-foreground)]">{tenant.name}</div>
                      <div className="text-sm text-[color:var(--color-muted)]">{tenant.slug}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getTierBadge(
                        tenant.tier
                      )}`}
                    >
                      {tenant.tier}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(
                        tenant.status
                      )}`}
                    >
                      {tenant.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[color:var(--color-foreground)]">
                    {tenant._count.users}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[color:var(--color-foreground)]">
                    {tenant._count.documents}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[color:var(--color-muted)]">
                    {new Date(tenant.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      href={`/admin/tenants/${tenant.id}` as any}
                      className="text-[color:var(--color-primary)] hover:text-[color:var(--color-accent)] mr-4"
                    >
                      View
                    </Link>
                    <Link
                      href={`/admin/tenants/${tenant.id}/edit` as any}
                      className="text-[color:var(--color-info)] hover:text-[color:var(--color-info)]"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {tenants.length === 0 && (
            <div className="text-center py-12">
              <p className="text-[color:var(--color-muted)]">No tenants found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
