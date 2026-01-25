'use client';

import { SunIcon, MoonIcon, DesktopIcon, CheckIcon } from '@radix-ui/react-icons';
import { useTheme } from '@/components/ThemeProvider';

type ColorMode = 'light' | 'dark' | 'system';

const themeOptions: Array<{
  value: ColorMode;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { value: 'light', label: 'Light', description: 'Light background with dark text', icon: SunIcon },
  { value: 'dark', label: 'Dark', description: 'Dark background with light text', icon: MoonIcon },
  { value: 'system', label: 'System', description: 'Follows your device settings', icon: DesktopIcon },
];

export function ThemeSettings() {
  const { mode, setMode, resolvedMode } = useTheme();

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium text-[color:var(--color-foreground)] mb-1">
          Color Mode
        </h3>
        <p className="text-sm text-[color:var(--color-muted)] mb-4">
          Choose how the interface appears to you
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {themeOptions.map((option) => {
          const isSelected = mode === option.value;
          const Icon = option.icon;

          return (
            <button
              key={option.value}
              onClick={() => setMode(option.value)}
              className={`relative flex flex-col items-center p-4 rounded-xl border-2 transition-all ${
                isSelected
                  ? 'border-[color:var(--color-primary)] bg-[color:var(--color-primary)]/5'
                  : 'border-[color:var(--color-border)] hover:border-[color:var(--color-muted)]'
              }`}
            >
              {isSelected && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[color:var(--color-primary)] flex items-center justify-center">
                  <CheckIcon className="w-3 h-3 text-white" />
                </div>
              )}
              <div
                className={`p-3 rounded-lg mb-2 ${
                  isSelected
                    ? 'bg-[color:var(--color-primary)]/10 text-[color:var(--color-primary)]'
                    : 'bg-[color:var(--color-surface-alt)] text-[color:var(--color-muted)]'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="font-medium text-[color:var(--color-foreground)]">{option.label}</span>
              <span className="text-xs text-[color:var(--color-muted)] text-center mt-1">
                {option.description}
              </span>
              {option.value === 'system' && isSelected && (
                <span className="text-xs text-[color:var(--color-primary)] mt-2">
                  Currently: {resolvedMode}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
