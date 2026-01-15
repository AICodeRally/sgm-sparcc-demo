'use client';

import { useState, useEffect } from 'react';
import { SetPageTitle } from '@/components/SetPageTitle';
import { CheckIcon, ResetIcon, PersonIcon } from '@radix-ui/react-icons';
import { getClientName, setClientName, resetClientName, DEFAULT_CLIENT } from '@/lib/config/client-config';

export default function ClientSettingsPage() {
  const [name, setName] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setName(getClientName());
  }, []);

  const handleSave = () => {
    setClientName(name);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    resetClientName();
    setName(DEFAULT_CLIENT);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <>
      <SetPageTitle
        title="Client Settings"
        description="Configure the demo client name used throughout the application"
      />
      <div className="min-h-screen bg-[color:var(--color-background)]">
        <div className="max-w-2xl mx-auto px-6 py-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-[color:var(--color-foreground)]">
              Client Configuration
            </h1>
            <p className="text-[color:var(--color-muted)] mt-2">
              Set the client name that appears throughout the application for demos and presentations.
            </p>
          </div>

          <div className="bg-[color:var(--color-surface)] rounded-xl border border-[color:var(--color-border)] p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--color-surface-alt)]">
                <PersonIcon className="h-5 w-5 text-[color:var(--color-primary)]" />
              </div>
              <div>
                <h2 className="font-semibold text-[color:var(--color-foreground)]">Demo Client Name</h2>
                <p className="text-sm text-[color:var(--color-muted)]">
                  This name will appear in client dashboards, reports, and navigation
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[color:var(--color-foreground)] mb-2">
                  Client Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter client name..."
                  className="w-full px-4 py-3 rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-background)] text-[color:var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)] focus:border-transparent"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[color:var(--color-primary)] text-white font-medium hover:opacity-90 transition-all"
                >
                  {saved ? <CheckIcon className="w-4 h-4" /> : null}
                  {saved ? 'Saved!' : 'Save Changes'}
                </button>
                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[color:var(--color-surface-alt)] border border-[color:var(--color-border)] text-[color:var(--color-foreground)] font-medium hover:bg-[color:var(--color-surface)] transition-all"
                >
                  <ResetIcon className="w-4 h-4" />
                  Reset to Default
                </button>
              </div>
            </div>
          </div>

          <div className="bg-[color:var(--color-surface-alt)] rounded-lg p-4 border border-[color:var(--color-border)]">
            <h3 className="font-semibold text-[color:var(--color-foreground)] mb-2">
              Where This Name Appears
            </h3>
            <ul className="text-sm text-[color:var(--color-muted)] space-y-1">
              <li>• Client dashboard headers and navigation</li>
              <li>• Gap analysis reports</li>
              <li>• Policy coverage matrices</li>
              <li>• Roadmap and implementation plans</li>
              <li>• Oversee mode client references</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
