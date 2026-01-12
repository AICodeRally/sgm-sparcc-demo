'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRightIcon } from '@radix-ui/react-icons';

interface FeatureTileProps {
  href: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  count?: number | string;
  primary?: boolean;
}

/**
 * Feature tile for mode landing pages
 * Clickable card that links to a specific feature
 */
export function FeatureTile({
  href,
  label,
  description,
  icon,
  count,
  primary = false,
}: FeatureTileProps) {
  return (
    <Link href={href as any}>
      <div
        className={`bg-[color:var(--color-surface)] rounded-xl border-2 transition-all cursor-pointer h-full group ${
          primary
            ? 'border-[color:var(--color-border)] hover:border-[color:var(--color-primary)] hover:shadow-xl p-8'
            : 'border-[color:var(--color-border)] hover:border-[color:var(--color-border)] hover:shadow-lg p-6'
        }`}
      >
        {/* Icon */}
        {icon && (
          <div className={`mb-4 ${primary ? 'text-[color:var(--color-primary)]' : 'text-[color:var(--color-foreground)]'}`}>
            {icon}
          </div>
        )}

        {/* Label and Count */}
        <div className="flex items-center justify-between mb-2">
          <h3
            className={`font-bold ${
              primary ? 'text-2xl text-[color:var(--color-foreground)]' : 'text-lg text-[color:var(--color-foreground)]'
            }`}
          >
            {label}
          </h3>
          {count !== undefined && (
            <span
              className={`px-3 py-1 rounded-full text-sm font-semibold ${
                primary
                  ? 'bg-[color:var(--color-surface-alt)] text-[color:var(--color-primary)]'
                  : 'bg-[color:var(--color-surface-alt)] text-[color:var(--color-foreground)]'
              }`}
            >
              {count}
            </span>
          )}
        </div>

        {/* Description */}
        {description && (
          <p className={`text-[color:var(--color-muted)] mb-4 ${primary ? 'text-base' : 'text-sm'}`}>
            {description}
          </p>
        )}

        {/* CTA */}
        <div
          className={`flex items-center gap-2 font-medium group-hover:gap-3 transition-all ${
            primary ? 'text-[color:var(--color-primary)] text-base' : 'text-[color:var(--color-foreground)] text-sm'
          }`}
        >
          Open <ArrowRightIcon className="w-4 h-4" />
        </div>
      </div>
    </Link>
  );
}
