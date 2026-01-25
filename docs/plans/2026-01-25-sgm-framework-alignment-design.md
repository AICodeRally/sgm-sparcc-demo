# SGM Framework Alignment Design

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Align SGM-SPARCC-Demo with aicr and LUMEN patterns for consistency across the platform family.

**Scope:**
1. Rename AskDock to AskItem (naming consistency)
2. Add role-based admin visibility (security/UX)
3. Add ThemeSettings component (user preference)

**Tech Stack:** Next.js 14+, TypeScript, Tailwind CSS, NextAuth, Radix Icons

---

## Phase 1: Rename AskDock to AskItem

### Task 1.1: Rename Component File

**Files:**
- Rename: `components/ai/AskDock.tsx` → `components/ai/AskItem.tsx`

**Step 1: Rename file and update component**

```bash
mv components/ai/AskDock.tsx components/ai/AskItem.tsx
```

Update component name inside file:
- `AskDockProps` → `AskItemProps`
- `export function AskDock` → `export function AskItem`
- Update JSDoc comments referencing AskDock

**Step 2: Commit**

```bash
git add components/ai/
git commit -m "refactor(ai): rename AskDock to AskItem for consistency with aicr"
```

---

### Task 1.2: Update AISettingsProvider Feature Key

**Files:**
- Modify: `components/ai/AISettingsProvider.tsx`

**Step 1: Update type and default**

Change:
```tsx
type AIFeature = 'opsChief' | 'pulse' | 'tasks' | 'askDock' | 'pageKb';
```

To:
```tsx
type AIFeature = 'opsChief' | 'pulse' | 'tasks' | 'askItem' | 'pageKb';
```

Update default enabled features set if it includes 'askDock'.

**Step 2: Commit**

```bash
git add components/ai/AISettingsProvider.tsx
git commit -m "refactor(ai): update feature key askDock to askItem"
```

---

### Task 1.3: Update All Imports

**Files:**
- Modify: `app/(app)/layout.tsx`
- Modify: `app/RootLayoutClient.tsx`
- Modify: `components/AppLayout.tsx`
- Modify: `components/ai/index.ts` (if exists)

**Step 1: Update imports and usages**

Change all occurrences:
```tsx
// Before
import { AskDock } from '@/components/ai/AskDock';
<AskDock appName="SGM" enabled={isFeatureEnabled('askDock')} />

// After
import { AskItem } from '@/components/ai/AskItem';
<AskItem appName="SGM" enabled={isFeatureEnabled('askItem')} />
```

**Step 2: Verify app builds**

```bash
npm run build
```

**Step 3: Commit**

```bash
git add app/ components/
git commit -m "refactor: update all AskDock imports to AskItem"
```

---

## Phase 2: Role-Based Admin Visibility

### Task 2.1: Create useCurrentUser Hook

**Files:**
- Create: `lib/auth/useCurrentUser.ts`

**Step 1: Write the hook**

```tsx
'use client';

import { useSession } from 'next-auth/react';

export interface CurrentUser {
  id: string;
  email: string;
  name: string | null;
  isAdmin: boolean;
  isGuest: boolean;
}

export function useCurrentUser(): CurrentUser | null {
  const { data: session, status } = useSession();

  if (status !== 'authenticated' || !session?.user) {
    return null;
  }

  // Admin detection - can be extended to check database roles
  const email = session.user.email || '';
  const isAdmin = email.includes('admin')
    || email.endsWith('@aicr.platform')
    || (session.user as any).role === 'admin';

  return {
    id: (session.user as any).id || session.user.email || 'unknown',
    email,
    name: session.user.name || null,
    isAdmin,
    isGuest: email === 'guest@sgm.local' || email.includes('guest'),
  };
}
```

**Step 2: Export from auth index**

Update `lib/auth/index.ts` (create if needed):
```tsx
export { useCurrentUser } from './useCurrentUser';
export type { CurrentUser } from './useCurrentUser';
```

**Step 3: Commit**

```bash
git add lib/auth/
git commit -m "feat(auth): add useCurrentUser hook with isAdmin flag"
```

---

### Task 2.2: Update Settings Page

**Files:**
- Modify: `app/(app)/settings/page.tsx`

**Step 1: Import and use hook**

```tsx
import { useCurrentUser } from '@/lib/auth/useCurrentUser';

export default function SettingsPage() {
  const user = useCurrentUser();

  // ... existing settingsSections ...

  return (
    <>
      {/* User sections - always visible */}
      <div className="grid gap-4">
        {settingsSections.map((section) => (...))}
      </div>

      {/* Admin sections - only for admins */}
      {user?.isAdmin && (
        <>
          <div className="mt-12 mb-8">
            <h2 className="text-xl font-bold text-[color:var(--color-foreground)]">Administration</h2>
            <p className="text-[color:var(--color-muted)] mt-1">System administration and monitoring</p>
          </div>
          <div className="grid gap-4">
            {adminSections.map((section) => (...))}
          </div>
        </>
      )}
    </>
  );
}
```

**Step 2: Test with different users**

- Login as regular user: Admin section hidden
- Login as admin user: Admin section visible

**Step 3: Commit**

```bash
git add app/(app)/settings/page.tsx
git commit -m "feat(settings): hide admin sections for non-admin users"
```

---

## Phase 3: Theme Settings Component

### Task 3.1: Verify ThemeProvider API

**Files:**
- Check: `components/ThemeProvider.tsx`

**Step 1: Verify exports**

Ensure ThemeProvider exports:
- `colorMode: 'light' | 'dark' | 'system'`
- `setColorMode: (mode) => void`
- `resolvedMode: 'light' | 'dark'`

If not, add these to the context value.

**Step 2: Commit if changes needed**

```bash
git add components/ThemeProvider.tsx
git commit -m "feat(theme): expose colorMode and resolvedMode from ThemeProvider"
```

---

### Task 3.2: Create ThemeSettings Component

**Files:**
- Create: `components/settings/ThemeSettings.tsx`

**Step 1: Write component**

```tsx
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
  const { colorMode, setColorMode, resolvedMode } = useTheme();

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
          const isSelected = colorMode === option.value;
          const Icon = option.icon;

          return (
            <button
              key={option.value}
              onClick={() => setColorMode(option.value)}
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
              <div className={`p-3 rounded-lg mb-2 ${
                isSelected
                  ? 'bg-[color:var(--color-primary)]/10 text-[color:var(--color-primary)]'
                  : 'bg-[color:var(--color-surface-alt)] text-[color:var(--color-muted)]'
              }`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="font-medium text-[color:var(--color-foreground)]">{option.label}</span>
              <span className="text-xs text-[color:var(--color-muted)] text-center mt-1">{option.description}</span>
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
```

**Step 2: Create index export**

Create `components/settings/index.ts`:
```tsx
export { ThemeSettings } from './ThemeSettings';
```

**Step 3: Commit**

```bash
git add components/settings/
git commit -m "feat(settings): add ThemeSettings component with light/dark/system toggle"
```

---

### Task 3.3: Add ThemeSettings to Profile Page

**Files:**
- Modify: `app/(app)/settings/profile/page.tsx`

**Step 1: Import and add section**

```tsx
import { ThemeSettings } from '@/components/settings/ThemeSettings';

export default function ProfileSettingsPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      {/* Existing profile content */}

      {/* Appearance Section */}
      <section className="mt-8 p-6 bg-[color:var(--color-surface)] rounded-lg border border-[color:var(--color-border)]">
        <h2 className="text-lg font-semibold text-[color:var(--color-foreground)] mb-4">
          Appearance
        </h2>
        <ThemeSettings />
      </section>
    </div>
  );
}
```

**Step 2: Test theme switching**

- Click each option, verify theme changes
- Verify system option respects OS preference
- Verify preference persists across page refresh

**Step 3: Commit**

```bash
git add app/(app)/settings/profile/page.tsx
git commit -m "feat(settings): add ThemeSettings to profile page"
```

---

## Phase 4: Final Verification

### Task 4.1: Build and Test

**Step 1: Run full build**

```bash
npm run build
```

Expected: Build succeeds with no errors

**Step 2: Run type check**

```bash
npm run type-check
```

Expected: No type errors

**Step 3: Manual testing checklist**

- [ ] AskItem orb appears and functions correctly
- [ ] Feature toggle for askItem works in AI settings
- [ ] Non-admin user doesn't see admin sections in settings
- [ ] Admin user sees admin sections
- [ ] Theme toggle works (light/dark/system)
- [ ] Theme preference persists after refresh
- [ ] No console errors

**Step 4: Final commit**

```bash
git add .
git commit -m "chore: verify SGM framework alignment complete"
```

---

## Summary

| Phase | Description | Files Changed |
|-------|-------------|---------------|
| 1 | AskDock → AskItem rename | 6 files |
| 2 | Role-based admin visibility | 2 files (1 new) |
| 3 | ThemeSettings component | 3 files (2 new) |
| 4 | Verification | - |

**Total:** ~11 files modified/created
