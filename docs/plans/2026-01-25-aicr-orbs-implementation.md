# AICR Orbs Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build the `@aicr/orbs` package with AI Dock UI and integrate it into SGM as the pilot app.

**Architecture:** Create a shared React package (`@aicr/orbs`) in the AICR monorepo that exports the AI Dock and individual orb components. Apps consume via npm and configure via `orb-manifest.json`.

**Tech Stack:** React 18+, TypeScript, Tailwind CSS, Framer Motion (animations), Zod (manifest validation)

---

## Phase 1: Package Scaffold (AICR Repo)

### Task 1.1: Create Package Structure

**Repo:** ~/dev/aicr

**Files:**
- Create: `packages/orbs/package.json`
- Create: `packages/orbs/tsconfig.json`
- Create: `packages/orbs/src/index.ts`

**Step 1: Create package.json**

```json
{
  "name": "@aicr/orbs",
  "version": "0.1.0",
  "description": "AI Orbs package for AICR platform",
  "main": "dist/index.js",
  "module": "dist/index.mjs",
  "types": "dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  },
  "scripts": {
    "build": "tsup src/index.ts --format cjs,esm --dts",
    "dev": "tsup src/index.ts --format cjs,esm --dts --watch",
    "lint": "eslint src/",
    "type-check": "tsc --noEmit"
  },
  "peerDependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  },
  "dependencies": {
    "framer-motion": "^11.0.0",
    "zod": "^3.22.0"
  },
  "devDependencies": {
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "tsup": "^8.0.0",
    "typescript": "^5.0.0"
  }
}
```

**Step 2: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "ES2020"],
    "jsx": "react-jsx",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "declaration": true,
    "declarationMap": true,
    "outDir": "dist"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

**Step 3: Create src/index.ts (entry point)**

```typescript
// Types
export * from './types/orb';
export * from './types/manifest';
export * from './types/signals';

// Providers
export { OrbProvider, useOrbs } from './providers/OrbProvider';

// Dock
export { AIDock } from './dock/AIDock';

// Individual Orbs (for custom layouts)
export { AskOrb } from './orbs/Ask';
export { OpsOrb } from './orbs/Ops';
export { PulseOrb } from './orbs/Pulse';
export { TasksOrb } from './orbs/Tasks';
export { KBOrb } from './orbs/KB';
```

**Step 4: Commit**

```bash
cd ~/dev/aicr
git add packages/orbs/
git commit -m "feat(orbs): scaffold @aicr/orbs package"
```

---

### Task 1.2: Define Type Contracts

**Repo:** ~/dev/aicr

**Files:**
- Create: `packages/orbs/src/types/orb.ts`
- Create: `packages/orbs/src/types/manifest.ts`
- Create: `packages/orbs/src/types/signals.ts`

**Step 1: Create orb.ts**

```typescript
import { z } from 'zod';

export const OrbIdSchema = z.enum(['ask', 'ops', 'pulse', 'tasks', 'kb']);
export type OrbId = z.infer<typeof OrbIdSchema>;

export const OrbStatusSchema = z.enum(['connected', 'disconnected', 'checking', 'error']);
export type OrbStatus = z.infer<typeof OrbStatusSchema>;

export interface OrbDefinition {
  id: OrbId;
  name: string;
  description: string;
  icon: string;
  version: string;
  signals: {
    subscribes: string[];
    emits: string[];
  };
  endpoints: {
    invoke?: string;
    health?: string;
    history?: string;
  };
  features: {
    streaming?: boolean;
    citations?: boolean;
    contextAwareness?: boolean;
  };
}

export interface OrbState {
  id: OrbId;
  status: OrbStatus;
  badgeCount: number;
  lastActivity?: Date;
  error?: string;
}
```

**Step 2: Create manifest.ts**

```typescript
import { z } from 'zod';
import { OrbIdSchema } from './orb';

export const DockPositionSchema = z.enum(['bottom', 'left', 'right']);
export type DockPosition = z.infer<typeof DockPositionSchema>;

export const OrbConfigSchema = z.object({
  extends: z.string(),
  enabled: z.boolean().default(true),
  overrides: z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    endpoints: z.record(z.string()).optional(),
  }).optional(),
  branding: z.object({
    gradient: z.tuple([z.string(), z.string()]).optional(),
    icon: z.string().optional(),
  }).optional(),
  signals: z.object({
    subscribes: z.array(z.string()).optional(),
  }).optional(),
});

export const OrbManifestSchema = z.object({
  app: z.string(),
  platform: z.literal('aicr'),
  version: z.string(),
  orbs: z.record(OrbIdSchema, OrbConfigSchema),
  dock: z.object({
    position: DockPositionSchema.default('bottom'),
    autoHide: z.boolean().default(false),
    magnification: z.boolean().default(true),
  }).optional(),
});

export type OrbConfig = z.infer<typeof OrbConfigSchema>;
export type OrbManifest = z.infer<typeof OrbManifestSchema>;
```

**Step 3: Create signals.ts**

```typescript
import { z } from 'zod';
import { OrbIdSchema } from './orb';

export const SignalTypeSchema = z.enum([
  // Ask signals
  'ASK_QUERY_SUBMITTED',
  'ASK_RESPONSE_RECEIVED',
  'ASK_CITATION_CLICKED',
  // Ops signals
  'OPS_ANOMALY_DETECTED',
  'OPS_THRESHOLD_CROSSED',
  'OPS_DRIFT_DETECTED',
  'OPS_ALERT_ACKNOWLEDGED',
  // Pulse signals
  'PULSE_RECOMMENDATION_NEW',
  'PULSE_LEARNING_OPPORTUNITY',
  'PULSE_ACTION_SUGGESTED',
  'PULSE_ITEM_DISMISSED',
  // Tasks signals
  'TASK_CREATED',
  'TASK_UPDATED',
  'TASK_COMPLETED',
  'TASK_BLOCKED',
  // KB signals
  'KB_DOC_UPDATED',
  'KB_SEARCH_PERFORMED',
]);

export type SignalType = z.infer<typeof SignalTypeSchema>;

export interface Signal {
  id: string;
  type: SignalType;
  orbId: OrbIdSchema;
  payload: Record<string, unknown>;
  timestamp: Date;
  read: boolean;
}
```

**Step 4: Commit**

```bash
git add packages/orbs/src/types/
git commit -m "feat(orbs): add type contracts for orbs, manifest, signals"
```

---

### Task 1.3: Create Orb Provider

**Repo:** ~/dev/aicr

**Files:**
- Create: `packages/orbs/src/providers/OrbProvider.tsx`

**(See full implementation in design document)**

**Step 4: Commit**

```bash
git add packages/orbs/src/providers/
git commit -m "feat(orbs): add OrbProvider with settings persistence"
```

---

## Phase 2: AI Dock Component

### Task 2.1: Create Dock Item Component

**Repo:** ~/dev/aicr

**Files:**
- Create: `packages/orbs/src/dock/DockItem.tsx`

**(See full implementation in design document)**

---

### Task 2.2: Create Dock Panel Component

**Repo:** ~/dev/aicr

**Files:**
- Create: `packages/orbs/src/dock/DockPanel.tsx`

**(See full implementation in design document)**

---

### Task 2.3: Create Main AI Dock Component

**Repo:** ~/dev/aicr

**Files:**
- Create: `packages/orbs/src/dock/AIDock.tsx`

**(See full implementation in design document)**

---

### Task 2.4: Create Dock Index Export

**Repo:** ~/dev/aicr

**Files:**
- Create: `packages/orbs/src/dock/index.ts`

---

## Phase 3: Orb Components

### Task 3.1: Create Ask Orb

**Repo:** ~/dev/aicr

**Files:**
- Create: `packages/orbs/src/orbs/Ask.tsx`

---

### Task 3.2: Create Remaining Orbs

**Repo:** ~/dev/aicr

**Files:**
- Create: `packages/orbs/src/orbs/Ops.tsx`
- Create: `packages/orbs/src/orbs/Pulse.tsx`
- Create: `packages/orbs/src/orbs/Tasks.tsx`
- Create: `packages/orbs/src/orbs/KB.tsx`
- Create: `packages/orbs/src/orbs/index.ts`

---

## Phase 4: SGM Integration (Pilot)

### Task 4.1: Create orb-manifest.json

**Repo:** ~/dev/sgm-sparcc-demo (this worktree)

**Files:**
- Create: `orb-manifest.json`

```json
{
  "app": "sgm-sparcc",
  "platform": "aicr",
  "version": "1.0.0",
  "orbs": {
    "ask": {
      "extends": "@aicr/orbs/ask",
      "enabled": true,
      "overrides": {
        "name": "Ask SGM",
        "endpoints": {
          "invoke": "/api/ai/asksgm"
        }
      },
      "branding": {
        "gradient": ["#1e3a5f", "#0891b2"]
      }
    },
    "ops": {
      "extends": "@aicr/orbs/ops",
      "enabled": true,
      "overrides": {
        "name": "OpsChief"
      }
    },
    "pulse": {
      "extends": "@aicr/orbs/pulse",
      "enabled": true
    },
    "tasks": {
      "extends": "@aicr/orbs/tasks",
      "enabled": true
    },
    "kb": {
      "extends": "@aicr/orbs/kb",
      "enabled": true,
      "overrides": {
        "name": "SGM Docs"
      }
    }
  },
  "dock": {
    "position": "bottom",
    "autoHide": false,
    "magnification": true
  }
}
```

---

### Task 4.2: Update Layout to Use AI Dock

**Repo:** ~/dev/sgm-sparcc-demo

**Files:**
- Modify: `app/RootLayoutClient.tsx`

---

### Task 4.3: Remove Old Orb Components

**Repo:** ~/dev/sgm-sparcc-demo

**Files:**
- Delete old orb implementations from `components/ai/`

---

## Phase 5: Settings UI

### Task 5.1: Create AI Dock Settings Page

**Repo:** ~/dev/sgm-sparcc-demo

**Files:**
- Create: `app/(app)/settings/ai-dock/page.tsx`

---

## Summary

| Phase | Tasks | Repo | Description |
|-------|-------|------|-------------|
| **1** | 1.1-1.3 | AICR | Package scaffold, types, provider |
| **2** | 2.1-2.4 | AICR | AI Dock UI components |
| **3** | 3.1-3.2 | AICR | Individual orb components |
| **4** | 4.1-4.3 | SGM | Integration (pilot) |
| **5** | 5.1 | SGM | Settings UI |

**Total Tasks:** 12 tasks across 5 phases

---

**Execution:** Choose subagent-driven (this session) or parallel session with executing-plans.
