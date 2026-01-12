import {
  BarChartIcon,
  CheckCircledIcon,
  CrossCircledIcon,
  ExclamationTriangleIcon,
  InfoCircledIcon,
  TargetIcon,
  ValueIcon,
} from '@radix-ui/react-icons';
import { ReactNode } from 'react';

type TokenKey = 'OK' | 'WARN' | 'ALERT' | 'NOTE' | 'INFO' | 'TARGET' | 'CHART' | 'COST';

const tokenMap: Record<
  TokenKey,
  { icon: React.ComponentType<any>; color: string; label: string }
> = {
  OK: { icon: CheckCircledIcon, color: 'var(--color-success)', label: 'Success' },
  WARN: { icon: ExclamationTriangleIcon, color: 'var(--color-warning)', label: 'Warning' },
  ALERT: { icon: CrossCircledIcon, color: 'var(--color-error)', label: 'Alert' },
  NOTE: { icon: InfoCircledIcon, color: 'var(--color-accent)', label: 'Note' },
  INFO: { icon: InfoCircledIcon, color: 'var(--color-accent)', label: 'Info' },
  TARGET: { icon: TargetIcon, color: 'var(--color-primary)', label: 'Target' },
  CHART: { icon: BarChartIcon, color: 'var(--color-accent)', label: 'Chart' },
  COST: { icon: ValueIcon, color: 'var(--color-secondary)', label: 'Cost' },
};

const TOKEN_REGEX = /\[(OK|WARN|ALERT|NOTE|INFO|TARGET|CHART|COST)\]/g;

export function renderTokenizedText(text: string): ReactNode {
  const normalized = text
    .replace(/❌/g, '[ALERT]')
    .replace(/⚠️?/g, '[WARN]')
    .replace(/⭐/g, '[TARGET]')
    .replace(/⏱️/g, '[INFO]')
    .replace(/([0-9])️⃣/g, '$1.');

  const parts = normalized.split(TOKEN_REGEX);

  return parts.map((part, idx) => {
    const token = tokenMap[part as TokenKey];

    if (token) {
      const Icon = token.icon;
      return (
        <span
          key={`token-${idx}`}
          className="inline-flex items-center gap-1 align-middle px-0.5"
          aria-label={token.label}
        >
          <Icon className="w-4 h-4" style={{ color: token.color }} />
        </span>
      );
    }

    return <span key={`text-${idx}`}>{part}</span>;
  });
}
