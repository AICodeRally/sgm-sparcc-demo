'use client';

/**
 * What's New Modal
 *
 * Introduces users to the 4-mode operational system
 * Shows on first visit, dismissable with "Don't show again"
 */

import { useState, useEffect } from 'react';
import { OperationalMode } from '@/types/operational-mode';
import { MODE_CONFIGS } from '@/lib/auth/mode-permissions';
import { CheckCircledIcon, Cross2Icon } from '@radix-ui/react-icons';

const WHATS_NEW_KEY = 'sgm-whats-new-modal-seen';
const MODAL_VERSION = '1.0'; // Increment to show modal again for updates

interface WhatsNewModalProps {
  onClose?: () => void;
}

export function WhatsNewModal({ onClose }: WhatsNewModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    // Check if user has seen this version of the modal
    const seenVersion = localStorage.getItem(WHATS_NEW_KEY);
    if (seenVersion !== MODAL_VERSION) {
      setIsOpen(true);
    }
  }, []);

  const handleClose = () => {
    if (dontShowAgain) {
      localStorage.setItem(WHATS_NEW_KEY, MODAL_VERSION);
    }
    setIsOpen(false);
    onClose?.();
  };

  if (!isOpen) {
    return null;
  }

  const modes = [
    {
      mode: OperationalMode.DESIGN,
      description: 'Build governance frameworks, policies, and compensation plan templates',
      features: ['Policy Library', 'Plan Templates', 'Governance Matrix', 'Gap Analysis'],
    },
    {
      mode: OperationalMode.OPERATE,
      description: 'Execute day-to-day compensation operations and approvals',
      features: ['Document Library', 'Plans Management', 'Approvals Queue', 'Reports & Analytics'],
    },
    {
      mode: OperationalMode.DISPUTE,
      description: 'Resolve exceptions, disputes, and escalations',
      features: ['Cases Management', 'Case SLA Tracking', 'Field Submissions', 'Resolution Workflows'],
    },
    {
      mode: OperationalMode.OVERSEE,
      description: 'Oversight, governance, risk, and compliance monitoring',
      features: ['Committee Management', 'Audit Timeline', 'Compliance Monitoring', 'Executive Dashboards'],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in">
      <div className="bg-[color:var(--color-surface)] rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="bg-[linear-gradient(90deg,var(--sparcc-gradient-start),var(--sparcc-gradient-mid2),var(--sparcc-gradient-end))] px-8 py-6 text-white relative">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 rounded-lg hover:bg-[color:var(--color-surface)]/20 transition-colors"
            aria-label="Close modal"
          >
            <Cross2Icon className="w-6 h-6" />
          </button>
          <h2 className="text-3xl font-bold mb-2">🎉 Welcome to the New SGM Platform!</h2>
          <p className="text-white/80 text-lg">
            We've reorganized the platform into 4 operational modes for better workflow
          </p>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="mb-8">
            <h3 className="text-xl font-bold text-[color:var(--color-foreground)] mb-4">Choose Your Workflow Mode</h3>
            <p className="text-[color:var(--color-muted)] mb-6">
              All features remain accessible, but now organized by role and workflow:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {modes.map(({ mode, description, features }) => {
                const config = MODE_CONFIGS[mode];
                return (
                  <div
                    key={mode}
                    className="border-2 rounded-xl p-5 hover:shadow-lg transition-all"
                    style={{
                      borderColor: `${config.color.hex}40`,
                      backgroundColor: `${config.color.hex}08`,
                    }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                        style={{ backgroundColor: `${config.color.hex}20` }}
                        dangerouslySetInnerHTML={{ __html: config.icon }}
                      />
                      <div>
                        <h4 className="font-bold text-lg" style={{ color: config.color.hex }}>
                          {config.label}
                        </h4>
                        <p className="text-xs text-[color:var(--color-muted)]">{config.description}</p>
                      </div>
                    </div>
                    <p className="text-sm text-[color:var(--color-foreground)] mb-3">{description}</p>
                    <div className="space-y-1">
                      {features.map((feature) => (
                        <div key={feature} className="flex items-center gap-2 text-xs text-[color:var(--color-muted)]">
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: config.color.hex }} />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-[color:var(--color-surface-alt)] border-2 border-[color:var(--color-info-border)] rounded-xl p-6">
            <h3 className="text-lg font-bold text-[color:var(--color-info)] mb-3">🔄 How to Switch Modes</h3>
            <div className="space-y-3 text-sm text-[color:var(--color-info)]">
              <div className="flex items-start gap-3">
                <span className="font-bold text-[color:var(--color-info)]">1.</span>
                <p>
                  <strong>Click mode tabs</strong> in the navigation bar at the top of the page
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="font-bold text-[color:var(--color-info)]">2.</span>
                <p>
                  <strong>Use the mode switcher</strong> dropdown next to your profile
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="font-bold text-[color:var(--color-info)]">3.</span>
                <p>
                  <strong>Keyboard shortcuts</strong>: Press{' '}
                  <kbd className="px-2 py-1 bg-[color:var(--color-surface)] border border-[color:var(--color-border)] rounded font-mono text-xs">
                    Cmd+1
                  </kbd>{' '}
                  through{' '}
                  <kbd className="px-2 py-1 bg-[color:var(--color-surface)] border border-[color:var(--color-border)] rounded font-mono text-xs">
                    Cmd+4
                  </kbd>{' '}
                  for quick switching
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="font-bold text-[color:var(--color-info)]">4.</span>
                <p>
                  <strong>Direct URLs</strong>: Navigate to /design, /operate, /dispute, or /oversee
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 bg-[color:var(--color-surface-alt)] border-2 border-[color:var(--color-border)] rounded-xl p-6">
            <h3 className="text-lg font-bold text-[color:var(--color-accent)] mb-2 inline-flex items-center gap-2">
              <CheckCircledIcon className="w-5 h-5" />
              Nothing Has Changed
            </h3>
            <p className="text-sm text-[color:var(--color-accent)]">
              All your existing features, documents, and workflows remain exactly where they were. The mode
              system is purely a navigation enhancement - you can still access everything via direct links
              or search.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-[color:var(--color-border)] px-8 py-6 bg-[color:var(--color-surface-alt)]">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.target.checked)}
                className="w-4 h-4 text-[color:var(--color-primary)] border-[color:var(--color-border)] rounded focus:ring-[color:var(--color-accent-border)]"
              />
              <span className="text-sm text-[color:var(--color-foreground)]">Don't show this again</span>
            </label>
            <button
              onClick={handleClose}
              className="px-6 py-2.5 bg-[linear-gradient(90deg,var(--sparcc-gradient-start),var(--sparcc-gradient-mid2),var(--sparcc-gradient-end))] text-white font-semibold rounded-lg hover:opacity-90 transition-all shadow-md hover:shadow-lg"
            >
              Got it, Let's Go!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
