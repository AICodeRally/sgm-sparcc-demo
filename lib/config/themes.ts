export type SparccTheme = {
  id: string;
  name: string;
  description: string;
  gradient: {
    start: string;
    mid1: string;
    mid2: string;
    end: string;
  };
  primary: string;
  secondary: string;
  accent: string;
};

export const SPARCC_THEMES: SparccTheme[] = [
  {
    id: 'sparcc-spm',
    name: 'SPARCC SPM',
    description: 'Blue → Indigo → Violet (SPM lineage)',
    gradient: {
      start: '#0ea5e9',
      mid1: '#3b82f6',
      mid2: '#6366f1',
      end: '#8b5cf6',
    },
    primary: '#0ea5e9',
    secondary: '#6366f1',
    accent: '#8b5cf6',
  },
  {
    id: 'sparcc-enterprise',
    name: 'SPARCC Enterprise',
    description: 'Full spectrum arc (Summit-facing builds)',
    gradient: {
      start: '#f97316',
      mid1: '#f59e0b',
      mid2: '#a855f7',
      end: '#06b6d4',
    },
    primary: '#f97316',
    secondary: '#a855f7',
    accent: '#06b6d4',
  },
  {
    id: 'sparcc-labs',
    name: 'SPARCC Labs',
    description: 'Teal → Cyan → Violet (experiments)',
    gradient: {
      start: '#22d3ee',
      mid1: '#0ea5e9',
      mid2: '#6366f1',
      end: '#a855f7',
    },
    primary: '#0ea5e9',
    secondary: '#22d3ee',
    accent: '#a855f7',
  },
];

export const DEFAULT_THEME = SPARCC_THEMES[0];
export const THEME_STORAGE_KEY = 'sparcc-active-theme';

export function getStoredTheme(): SparccTheme {
  if (typeof window === 'undefined') return DEFAULT_THEME;
  const storedId = window.localStorage.getItem(THEME_STORAGE_KEY);
  const found = SPARCC_THEMES.find((t) => t.id === storedId);
  return found || DEFAULT_THEME;
}

export function applyThemeVars(theme: SparccTheme) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.style.setProperty('--sparcc-gradient-start', theme.gradient.start);
  root.style.setProperty('--sparcc-gradient-mid1', theme.gradient.mid1);
  root.style.setProperty('--sparcc-gradient-mid2', theme.gradient.mid2);
  root.style.setProperty('--sparcc-gradient-end', theme.gradient.end);
  root.style.setProperty('--color-primary', theme.primary);
  root.style.setProperty('--color-secondary', theme.secondary);
  root.style.setProperty('--color-accent', theme.accent);
}

export type Tone = 'primary' | 'secondary' | 'accent' | 'infra';

export function getToneStyles(tone: Tone) {
  const theme = getStoredTheme();
  const toneColor =
    tone === 'primary'
      ? theme.primary
      : tone === 'secondary'
      ? theme.secondary
      : tone === 'accent'
      ? theme.accent
      : '#0f172a';

  const border = `1px solid ${tone === 'infra' ? '#1f2937' : toneColor}`;
  const shadow = `0 12px 28px -16px ${tone === 'infra' ? 'rgba(15,23,42,0.35)' : `${toneColor}55`}`;
  const hover = tone === 'infra' ? '#111827' : toneColor;

  return {
    color: toneColor,
    border,
    shadow,
    hover,
  };
}
