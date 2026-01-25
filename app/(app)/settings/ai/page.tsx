'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { SetPageTitle } from '@/components/SetPageTitle';
import { Breadcrumb } from '@/components/Breadcrumb';
import { useAISettings } from '@/components/ai/AISettingsProvider';
import {
  LightningBoltIcon,
  ChatBubbleIcon,
  BellIcon,
  CheckCircledIcon,
  ReaderIcon,
  ExclamationTriangleIcon,
  InfoCircledIcon,
  ResetIcon,
} from '@radix-ui/react-icons';

interface FeatureToggleProps {
  id: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  enabled: boolean;
  disabled?: boolean;
  onChange: (enabled: boolean) => void;
}

function FeatureToggle({ id, label, description, icon: Icon, enabled, disabled, onChange }: FeatureToggleProps) {
  return (
    <div className={`flex items-center justify-between p-4 rounded-lg border ${
      disabled
        ? 'bg-[color:var(--color-surface-alt)] border-[color:var(--color-border)] opacity-60'
        : 'bg-[color:var(--color-surface)] border-[color:var(--color-border)]'
    }`}>
      <div className="flex items-center gap-4">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
          enabled && !disabled
            ? 'bg-[color:var(--color-primary)]/10 text-[color:var(--color-primary)]'
            : 'bg-[color:var(--color-surface-alt)] text-[color:var(--color-muted)]'
        }`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <label htmlFor={id} className="font-medium text-[color:var(--color-foreground)] cursor-pointer">
            {label}
          </label>
          <p className="text-sm text-[color:var(--color-muted)]">{description}</p>
        </div>
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={enabled}
        disabled={disabled}
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          disabled
            ? 'cursor-not-allowed bg-[color:var(--color-surface-alt)]'
            : enabled
              ? 'bg-[color:var(--color-primary)]'
              : 'bg-[color:var(--color-border)]'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}

export default function AISettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { settings, aiEnabled, setAIEnabled, setFeatureEnabled, reset } = useAISettings();
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Access control - only SUPER_ADMIN and ADMIN can access
  useEffect(() => {
    if (status === 'authenticated') {
      const role = (session?.user as any)?.role;
      if (role !== 'SUPER_ADMIN' && role !== 'ADMIN') {
        router.push('/settings');
      }
    }
  }, [status, session, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen sparcc-hero-bg flex items-center justify-center">
        <div className="animate-pulse text-[color:var(--color-muted)]">Loading...</div>
      </div>
    );
  }

  const userEmail = session?.user?.email || 'unknown';

  const handleMasterToggle = (enabled: boolean) => {
    setAIEnabled(enabled, userEmail);
  };

  const handleFeatureToggle = (feature: keyof typeof settings.features, enabled: boolean) => {
    setFeatureEnabled(feature, enabled, userEmail);
  };

  const handleReset = () => {
    reset();
    setShowResetConfirm(false);
  };

  const features = [
    {
      id: 'opsChief',
      key: 'opsChief' as const,
      label: 'OpsChief Insights',
      description: 'Operational alerts and system health monitoring',
      icon: LightningBoltIcon,
    },
    {
      id: 'askItem',
      key: 'askItem' as const,
      label: 'AskSGM Assistant',
      description: 'AI chat assistant for governance questions',
      icon: ChatBubbleIcon,
    },
    {
      id: 'pulse',
      key: 'pulse' as const,
      label: 'Pulse Notifications',
      description: 'AI-powered insights and urgent notifications',
      icon: BellIcon,
    },
    {
      id: 'tasks',
      key: 'tasks' as const,
      label: 'Task Management',
      description: 'Governance task tracking synced with AICR',
      icon: CheckCircledIcon,
    },
    {
      id: 'pageKb',
      key: 'pageKb' as const,
      label: 'Page Knowledge Base',
      description: 'Context-aware help and documentation panel',
      icon: ReaderIcon,
    },
  ];

  return (
    <>
      <SetPageTitle title="AI Features" description="Configure AI assistant settings" />
      <div className="min-h-screen sparcc-hero-bg">
        <div className="max-w-3xl mx-auto px-6 py-8">
          <Breadcrumb
            items={[
              { label: 'Settings', href: '/settings' },
              { label: 'AI Features' },
            ]}
          />

          <div className="mt-6 mb-8">
            <h1 className="text-2xl font-bold text-[color:var(--color-foreground)]">AI Features</h1>
            <p className="text-[color:var(--color-muted)] mt-1">
              Control AI assistant visibility for this session
            </p>
          </div>

          {/* Policy Warning */}
          <div className="mb-6 p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
            <div className="flex gap-3">
              <ExclamationTriangleIcon className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-amber-700 dark:text-amber-400">Client AI Policy</h3>
                <p className="text-sm text-amber-600 dark:text-amber-300 mt-1">
                  Some clients may have policies restricting AI assistant usage. Disable AI features
                  before demos or client sessions if their policy prohibits AI tools.
                </p>
              </div>
            </div>
          </div>

          {/* Master Toggle */}
          <div className="mb-8">
            <div className="p-6 rounded-xl bg-[color:var(--color-surface)] border-2 border-[color:var(--color-border)]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`flex h-14 w-14 items-center justify-center rounded-xl ${
                    aiEnabled
                      ? 'bg-gradient-to-br from-[color:var(--color-primary)] to-[color:var(--color-accent)] text-white'
                      : 'bg-[color:var(--color-surface-alt)] text-[color:var(--color-muted)]'
                  }`}>
                    <LightningBoltIcon className="h-7 w-7" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-[color:var(--color-foreground)]">
                      AI Assistants
                    </h2>
                    <p className="text-[color:var(--color-muted)]">
                      {aiEnabled ? 'All AI features are enabled' : 'All AI features are disabled'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={aiEnabled}
                  onClick={() => handleMasterToggle(!aiEnabled)}
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                    aiEnabled
                      ? 'bg-[color:var(--color-primary)]'
                      : 'bg-[color:var(--color-border)]'
                  }`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-transform ${
                      aiEnabled ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Individual Feature Toggles */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-[color:var(--color-foreground)] mb-4">
              Individual Features
            </h3>
            <div className="space-y-3">
              {features.map((feature) => (
                <FeatureToggle
                  key={feature.id}
                  id={feature.id}
                  label={feature.label}
                  description={feature.description}
                  icon={feature.icon}
                  enabled={settings.features[feature.key]}
                  disabled={!aiEnabled}
                  onChange={(enabled) => handleFeatureToggle(feature.key, enabled)}
                />
              ))}
            </div>
            {!aiEnabled && (
              <p className="mt-3 text-sm text-[color:var(--color-muted)] flex items-center gap-2">
                <InfoCircledIcon className="h-4 w-4" />
                Enable the master toggle to configure individual features
              </p>
            )}
          </div>

          {/* Reset Section */}
          <div className="border-t border-[color:var(--color-border)] pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-[color:var(--color-foreground)]">Reset to Defaults</h3>
                <p className="text-sm text-[color:var(--color-muted)]">
                  Restore all AI features to their default enabled state
                </p>
              </div>
              {showResetConfirm ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowResetConfirm(false)}
                    className="px-4 py-2 text-sm rounded-lg border border-[color:var(--color-border)] text-[color:var(--color-muted)] hover:bg-[color:var(--color-surface-alt)]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReset}
                    className="px-4 py-2 text-sm rounded-lg bg-[color:var(--color-primary)] text-white hover:opacity-90"
                  >
                    Confirm Reset
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowResetConfirm(true)}
                  className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg border border-[color:var(--color-border)] text-[color:var(--color-muted)] hover:bg-[color:var(--color-surface-alt)]"
                >
                  <ResetIcon className="h-4 w-4" />
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Last Updated Info */}
          {settings.updatedAt && (
            <div className="mt-6 text-xs text-[color:var(--color-muted)]">
              Last updated: {new Date(settings.updatedAt).toLocaleString()}
              {settings.updatedBy && ` by ${settings.updatedBy}`}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
