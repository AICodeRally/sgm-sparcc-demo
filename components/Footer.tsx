'use client';

import Link from 'next/link';
import { OperationalMode } from '@/types/operational-mode';
import { MODE_CONFIGS } from '@/lib/auth/mode-permissions';

export function Footer() {
  const modes = [
    OperationalMode.DESIGN,
    OperationalMode.OPERATE,
    OperationalMode.DISPUTE,
    OperationalMode.OVERSEE,
  ];

  return (
    <footer
      className="bg-[color:var(--color-surface)] shadow-sm border-t-4 border-transparent fixed bottom-0 left-0 right-0 z-40"
      style={{
        borderImage:
          'linear-gradient(to right, var(--sparcc-gradient-start), var(--sparcc-gradient-mid2), var(--sparcc-gradient-end)) 1',
      }}
    >
      <div className="w-full px-6 py-4">
        <div className="flex items-center justify-center">
          {/* Center - Footer Info */}
          <div className="text-center">
            <div className="space-y-2">
              {/* Mode Quick Links */}
              <div className="flex items-center justify-center gap-6 mb-2">
                {modes.map((mode) => {
                  const config = MODE_CONFIGS[mode];
                  return (
                    <Link
                      key={mode}
                      href={`/${mode.toLowerCase()}` as any}
                      className="text-base hover:underline transition-all font-bold px-3 py-1 rounded hover:bg-[color:var(--surface-glass)]"
                      style={{ color: config.color.hex }}
                    >
                      {config.label}
                    </Link>
                  );
                })}
              </div>
              <div className="flex items-center justify-center gap-6 text-xs text-[color:var(--color-muted)]">
                <span>© 2026 BHG Consulting</span>
                <span>•</span>
                <a href="#" className="hover:text-[color:var(--color-primary)] transition-colors">Privacy</a>
                <span>•</span>
                <a href="#" className="hover:text-[color:var(--color-primary)] transition-colors">Terms</a>
                <span>•</span>
                <a href="#" className="hover:text-[color:var(--color-primary)] transition-colors">Support</a>
              </div>
              <div className="text-xs">
                <span className="text-[color:var(--color-muted)]">Part of the </span>
                <span
                  className="font-bold bg-clip-text text-transparent"
                  style={{
                    backgroundImage:
                      'linear-gradient(90deg, var(--sparcc-gradient-start), var(--sparcc-gradient-mid2), var(--sparcc-gradient-end))',
                  }}
                >
                  SPARCC
                </span>
                <span className="text-[color:var(--color-muted)]"> suite of SPM tools • Powered by </span>
                <span
                  className="font-bold bg-clip-text text-transparent"
                  style={{
                    backgroundImage:
                      'linear-gradient(90deg, var(--sparcc-gradient-start), var(--sparcc-gradient-mid2), var(--sparcc-gradient-end))',
                  }}
                >
                  AICR
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
