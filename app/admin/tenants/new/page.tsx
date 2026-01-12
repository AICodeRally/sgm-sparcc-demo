'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, FormEvent } from 'react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function NewTenantPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    tier: 'BETA',
    status: 'ACTIVE',
    maxDocuments: 500,
    maxUsers: 50,
    aiEnabled: true,
    auditRetentionDays: 2555,
    customBranding: true,
    industry: '',
    logo: '',
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          slug: formData.slug,
          tier: formData.tier,
          status: formData.status,
          features: {
            maxDocuments: formData.maxDocuments,
            maxUsers: formData.maxUsers,
            aiEnabled: formData.aiEnabled,
            auditRetentionDays: formData.auditRetentionDays,
            customBranding: formData.customBranding,
          },
          settings: {
            industry: formData.industry,
            logo: formData.logo,
          },
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to create tenant');
      }

      const tenant = await res.json();
      router.push(`/admin/tenants/${tenant.id}` as any);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  if (session?.user.role !== 'SUPER_ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[color:var(--color-error)]">Access denied. SUPER_ADMIN role required.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[color:var(--color-surface-alt)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/admin/tenants" className="text-[color:var(--color-primary)] hover:underline text-sm">
            ← Back to Tenants
          </Link>
          <h1 className="text-3xl font-bold text-[color:var(--color-foreground)] mt-4">Create New Tenant</h1>
          <p className="mt-2 text-sm text-[color:var(--color-muted)]">
            Add a new organization to the SGM platform
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-[color:var(--color-error-bg)] border border-[color:var(--color-error-border)] rounded-md">
            <p className="text-sm text-[color:var(--color-error)]">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-[color:var(--color-surface)] rounded-lg shadow p-6 space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h2 className="text-lg font-medium text-[color:var(--color-foreground)]">Basic Information</h2>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-[color:var(--color-foreground)]">
                Tenant Name *
              </label>
              <input
                type="text"
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full rounded-md border-[color:var(--color-border)] shadow-sm focus:border-[color:var(--color-primary)] focus:ring-[color:var(--color-accent-border)]"
                placeholder="Henry Schein, Inc."
              />
            </div>

            <div>
              <label htmlFor="slug" className="block text-sm font-medium text-[color:var(--color-foreground)]">
                Slug * (URL-friendly identifier)
              </label>
              <input
                type="text"
                id="slug"
                required
                value={formData.slug}
                onChange={(e) =>
                  setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })
                }
                className="mt-1 block w-full rounded-md border-[color:var(--color-border)] shadow-sm focus:border-[color:var(--color-primary)] focus:ring-[color:var(--color-accent-border)]"
                placeholder="henryschein"
                pattern="[a-z0-9-]+"
              />
              <p className="mt-1 text-sm text-[color:var(--color-muted)]">
                Only lowercase letters, numbers, and hyphens
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="tier" className="block text-sm font-medium text-[color:var(--color-foreground)]">
                  Tier *
                </label>
                <select
                  id="tier"
                  value={formData.tier}
                  onChange={(e) => setFormData({ ...formData, tier: e.target.value })}
                  className="mt-1 block w-full rounded-md border-[color:var(--color-border)] shadow-sm focus:border-[color:var(--color-primary)] focus:ring-[color:var(--color-accent-border)]"
                >
                  <option value="DEMO">Demo</option>
                  <option value="BETA">Beta</option>
                  <option value="PRODUCTION">Production</option>
                </select>
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-[color:var(--color-foreground)]">
                  Status *
                </label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="mt-1 block w-full rounded-md border-[color:var(--color-border)] shadow-sm focus:border-[color:var(--color-primary)] focus:ring-[color:var(--color-accent-border)]"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="TRIAL">Trial</option>
                  <option value="SUSPENDED">Suspended</option>
                  <option value="EXPIRED">Expired</option>
                </select>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-4 border-t pt-6">
            <h2 className="text-lg font-medium text-[color:var(--color-foreground)]">Features & Limits</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="maxDocuments"
                  className="block text-sm font-medium text-[color:var(--color-foreground)]"
                >
                  Max Documents
                </label>
                <input
                  type="number"
                  id="maxDocuments"
                  value={formData.maxDocuments}
                  onChange={(e) =>
                    setFormData({ ...formData, maxDocuments: parseInt(e.target.value) })
                  }
                  className="mt-1 block w-full rounded-md border-[color:var(--color-border)] shadow-sm focus:border-[color:var(--color-primary)] focus:ring-[color:var(--color-accent-border)]"
                />
              </div>

              <div>
                <label htmlFor="maxUsers" className="block text-sm font-medium text-[color:var(--color-foreground)]">
                  Max Users
                </label>
                <input
                  type="number"
                  id="maxUsers"
                  value={formData.maxUsers}
                  onChange={(e) =>
                    setFormData({ ...formData, maxUsers: parseInt(e.target.value) })
                  }
                  className="mt-1 block w-full rounded-md border-[color:var(--color-border)] shadow-sm focus:border-[color:var(--color-primary)] focus:ring-[color:var(--color-accent-border)]"
                />
              </div>

              <div>
                <label
                  htmlFor="auditRetentionDays"
                  className="block text-sm font-medium text-[color:var(--color-foreground)]"
                >
                  Audit Retention (Days)
                </label>
                <input
                  type="number"
                  id="auditRetentionDays"
                  value={formData.auditRetentionDays}
                  onChange={(e) =>
                    setFormData({ ...formData, auditRetentionDays: parseInt(e.target.value) })
                  }
                  className="mt-1 block w-full rounded-md border-[color:var(--color-border)] shadow-sm focus:border-[color:var(--color-primary)] focus:ring-[color:var(--color-accent-border)]"
                />
                <p className="mt-1 text-sm text-[color:var(--color-muted)]">2555 days = 7 years</p>
              </div>
            </div>

            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.aiEnabled}
                  onChange={(e) => setFormData({ ...formData, aiEnabled: e.target.checked })}
                  className="rounded border-[color:var(--color-border)] text-[color:var(--color-primary)] focus:ring-[color:var(--color-accent-border)]"
                />
                <span className="ml-2 text-sm text-[color:var(--color-foreground)]">Enable AI Features</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.customBranding}
                  onChange={(e) =>
                    setFormData({ ...formData, customBranding: e.target.checked })
                  }
                  className="rounded border-[color:var(--color-border)] text-[color:var(--color-primary)] focus:ring-[color:var(--color-accent-border)]"
                />
                <span className="ml-2 text-sm text-[color:var(--color-foreground)]">Custom Branding</span>
              </label>
            </div>
          </div>

          {/* Settings */}
          <div className="space-y-4 border-t pt-6">
            <h2 className="text-lg font-medium text-[color:var(--color-foreground)]">Settings</h2>

            <div>
              <label htmlFor="industry" className="block text-sm font-medium text-[color:var(--color-foreground)]">
                Industry
              </label>
              <input
                type="text"
                id="industry"
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                className="mt-1 block w-full rounded-md border-[color:var(--color-border)] shadow-sm focus:border-[color:var(--color-primary)] focus:ring-[color:var(--color-accent-border)]"
                placeholder="Healthcare Distribution"
              />
            </div>

            <div>
              <label htmlFor="logo" className="block text-sm font-medium text-[color:var(--color-foreground)]">
                Logo URL
              </label>
              <input
                type="text"
                id="logo"
                value={formData.logo}
                onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                className="mt-1 block w-full rounded-md border-[color:var(--color-border)] shadow-sm focus:border-[color:var(--color-primary)] focus:ring-[color:var(--color-accent-border)]"
                placeholder="/logos/henryschein.png"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 border-t pt-6">
            <Link
              href="/admin/tenants"
              className="px-4 py-2 text-sm font-medium text-[color:var(--color-foreground)] hover:text-[color:var(--color-foreground)]"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-[linear-gradient(90deg,var(--sparcc-gradient-start),var(--sparcc-gradient-mid2),var(--sparcc-gradient-end))] text-white rounded-md hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Tenant'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
