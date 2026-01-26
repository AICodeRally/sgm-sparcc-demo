# AICR Orbs Strategy Design

**Date:** 2026-01-25
**Status:** Approved
**Scope:** Platform-wide AI Orbs architecture, configuration, and UI/UX
**Stakeholders:** All AICR-connected applications

---

## Executive Summary

This document defines the unified strategy for AI Orbs across the AICR platform and all connected applications. The goal is to consolidate divergent orb implementations into a single `@aicr/orbs` package with a macOS-style "AI Dock" UI pattern.

---

## Current State

### Problem: Divergent Implementations

| App | Orb Components | Status |
|-----|----------------|--------|
| sgm-sparcc-demo | AskItem, OpsChiefOrb, PulseOrb, TaskOrb | Full implementation |
| rcm-sparcc-demo | AskItem, OpsChiefOrb, PulseOrb, TaskOrb | Full implementation |
| np-edge-demo | AskPSOrb, OpsChiefOrb, PulseOrb, TaskOrb | Similar pattern |
| ps-edge-demo | AskPSOrb, OpsChiefOrb, PulseOrb, TaskOrb | Similar pattern |
| vms-edge-demo | AskDock, AskVMS, OpsChiefOrb, OrgChiefOrb | Different naming |
| lumen-summit-demo | AssistantOrb, PulseOrb, TaskOrb, AskItem | Independent UI-only |
| AICR shell | `AiOrb` (base component) | Not consumed by demos |

**Issue:** 6+ divergent copies of orb implementations with no shared package or centralized management.

---

## The 5 Platform Orbs

### 1. Ask

| Aspect | Definition |
|--------|------------|
| **Purpose** | Conversational Q&A with citations |
| **Behavior** | Reactive — responds when user initiates |
| **Backend** | Expert hierarchy + RAG (Spine) for context |
| **Example** | "What's our clawback policy?" → answer with citations |
| **Signals Emits** | `ASK_QUERY_SUBMITTED`, `ASK_RESPONSE_RECEIVED`, `ASK_CITATION_CLICKED` |

### 2. Ops (OpsChief)

| Aspect | Definition |
|--------|------------|
| **Purpose** | Deep pattern detection — finds anomalies and surfaces them |
| **Behavior** | Passive/silent until significant — "security monitoring" model |
| **Backend** | Telemetry feed → Detector mode analysis |
| **Example** | Detects unusual commission spike → surfaces alert |
| **Signals Subscribes** | `OPS_ANOMALY_*`, `OPS_THRESHOLD_*`, `OPS_DRIFT_*` |

### 3. Pulse

| Aspect | Definition |
|--------|------------|
| **Purpose** | Proactive coaching — daily recommendations and insights |
| **Behavior** | Active/continuous — "ChatGPT daily insights" model |
| **Backend** | Telemetry feed → Coach mode analysis |
| **Example** | "3 reps haven't acknowledged their plans — send reminder?" |
| **Signals Subscribes** | `PULSE_RECOMMEND_*`, `PULSE_LEARN_*`, `PULSE_ACTION_*` |

### 4. Tasks

| Aspect | Definition |
|--------|------------|
| **Purpose** | Work orchestration — track in-progress, blocked, assigned items |
| **Behavior** | State-driven — shows current work queue |
| **Backend** | Task API (separate from telemetry) |
| **Example** | "2 approvals pending", "1 blocked task" |

### 5. KB (Knowledge Base)

| Aspect | Definition |
|--------|------------|
| **Purpose** | AI-maintained app documentation |
| **Behavior** | Context-aware documentation that updates automatically |
| **Backend** | Spine RAG + documentation sync |
| **Example** | Auto-updated governance docs, searchable knowledge base |

---

## Architecture

### Configuration Model: Hybrid (Platform Base + App Extends)

```
AICR Platform
└── @aicr/orbs Catalog (base definitions)
    ├── ask (base config)
    ├── ops (base config)
    ├── pulse (base config)
    ├── tasks (base config)
    └── kb (base config)

Apps (SGM, RCM, etc.)
└── orb-manifest.json
    ├── extends: "@aicr/orbs/ask"
    ├── overrides: { signals, branding, endpoints }
    └── (no custom orbs — platform-defined only)
```

### Signal System: Hybrid

| Channel | Use Case |
|---------|----------|
| **WebSocket** | Real-time signal delivery (alerts, new messages) |
| **REST API** | Signal history, bulk queries, initial load |

### Manifest Location: Dual-Source

- **Source of Truth:** `orb-manifest.json` in app repo
- **Runtime:** Syncs to AICR on deploy
- **Benefit:** Version-controlled config + centralized visibility

### Custom Orbs: Not Allowed

Only platform-defined orbs (Ask, Ops, Pulse, Tasks, KB) are permitted. This ensures consistency across all AICR-connected applications.

---

## Platform Orb Schema

```yaml
# Base orb definition (lives in @aicr/orbs)
orb: ask
version: 1.0.0
name: "Ask"
description: "Conversational Q&A with citations"
icon: "chat-bubble"

signals:
  subscribes: []
  emits:
    - ASK_QUERY_SUBMITTED
    - ASK_RESPONSE_RECEIVED
    - ASK_CITATION_CLICKED

events:
  triggers: ["user_message"]

endpoints:
  invoke: "/api/ask/stream"
  health: "/api/ask/health"
  history: "/api/ask/conversations"

features:
  streaming: true
  citations: true
  context_awareness: true

defaults:
  position: "bottom"
  expanded: false
```

---

## App Manifest Schema

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
        "gradient": ["#1e3a5f", "#0891b2"],
        "icon": "chat-bubble"
      }
    },

    "ops": {
      "extends": "@aicr/orbs/ops",
      "enabled": true,
      "signals": {
        "subscribes": ["OPS_ANOMALY_*", "OPS_THRESHOLD_*", "OPS_DRIFT_*"]
      }
    },

    "pulse": {
      "extends": "@aicr/orbs/pulse",
      "enabled": true,
      "signals": {
        "subscribes": ["PULSE_RECOMMEND_*", "PULSE_LEARN_*", "PULSE_ACTION_*"]
      }
    },

    "tasks": {
      "extends": "@aicr/orbs/tasks",
      "enabled": true
    },

    "kb": {
      "extends": "@aicr/orbs/kb",
      "enabled": true,
      "overrides": {
        "name": "SGM Docs",
        "description": "AI-maintained governance documentation"
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

## UI/UX: AI Dock (macOS-style)

### Visual Design

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                      App Content                            │
│                                                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
          ┌─────────────────────────────────┐
          │  🗨️   🔍   💡   ✓   📚         │  ← AI Dock
          │  Ask  Ops  Pulse Task KB        │
          │   •        2          1         │  ← Badges
          └─────────────────────────────────┘
```

### Dock Behaviors

| Behavior | Description |
|----------|-------------|
| **Magnification on hover** | Icons grow when hovered (like macOS) |
| **Bounce on activity** | Icon bounces when orb has new content |
| **Badges** | Colored dot or count for unread items |
| **Click → Panel** | Opens floating panel above/beside the dock |
| **Active indicator** | Highlight bar under active orb |
| **Auto-hide** | Optional — dock hides when not in use |

### Panel + Page Mode

| Mode | Use Case | Route |
|------|----------|-------|
| **Panel (floating)** | Quick interactions, recent items | Click orb in dock |
| **Page (full)** | Deep work, full history, filters | `/orbs/ask`, `/orbs/ops`, etc. |

### Position Options (User Setting)

```
  ┌─────────┐      ┌─────────┐      ┌─────────┐
  │    ▐    │      │         │      │    ▌    │
  │    ▐    │      │  ▄▄▄▄▄  │      │    ▌    │
  │  Left   │      │ Bottom  │      │  Right  │
  └─────────┘      └─────────┘      └─────────┘
```

---

## User Settings Schema

```json
{
  "aiDock": {
    "position": "bottom | left | right",
    "autoHide": false,
    "magnification": true,
    "bounceOnActivity": true,
    "showBadges": true,
    "iconSize": 48,
    "orbOrder": ["ask", "ops", "pulse", "tasks", "kb"],
    "orbVisibility": {
      "ask": true,
      "ops": true,
      "pulse": true,
      "tasks": true,
      "kb": true
    }
  }
}
```

### Settings UI

```
┌─────────────────────────────────────────────────────────────┐
│  Settings > AI Dock                                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Position                                                   │
│  [ Left ]  [ Bottom ●]  [ Right ]                          │
│                                                             │
│  Behavior                                                   │
│  ☐ Auto-hide dock                                          │
│  ☑ Magnification on hover                                  │
│  ☑ Bounce on new activity                                  │
│  ☑ Show badges                                             │
│                                                             │
│  Orbs (drag to reorder)                                    │
│  ☰ 🗨️ Ask      [●]                                        │
│  ☰ 🔍 Ops      [●]                                        │
│  ☰ 💡 Pulse    [●]                                        │
│  ☰ ✓  Tasks    [●]                                        │
│  ☰ 📚 KB       [●]                                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Configuration Hierarchy

| Level | What's Configurable | Storage |
|-------|---------------------|---------|
| **Platform** | Orb definitions, base behavior, signal types | `@aicr/orbs` package |
| **App** | Which orbs enabled, branding, endpoints, overrides | `orb-manifest.json` in repo |
| **User** | Position, auto-hide, order, visibility | localStorage + sync to AICR |

---

## Implementation Packages

### @aicr/orbs (New Package)

```
packages/orbs/
├── src/
│   ├── orbs/
│   │   ├── Ask.tsx
│   │   ├── Ops.tsx
│   │   ├── Pulse.tsx
│   │   ├── Tasks.tsx
│   │   └── KB.tsx
│   ├── dock/
│   │   ├── AIDock.tsx
│   │   ├── DockItem.tsx
│   │   └── DockPanel.tsx
│   ├── hooks/
│   │   ├── useOrbSignals.ts
│   │   ├── useOrbHealth.ts
│   │   └── useOrbSettings.ts
│   ├── providers/
│   │   ├── OrbProvider.tsx
│   │   └── SignalProvider.tsx
│   ├── types/
│   │   ├── orb.ts
│   │   ├── signals.ts
│   │   └── manifest.ts
│   └── index.ts
├── catalog/
│   ├── ask.yaml
│   ├── ops.yaml
│   ├── pulse.yaml
│   ├── tasks.yaml
│   └── kb.yaml
└── package.json
```

### App Integration

```tsx
// In app layout
import { AIDock, OrbProvider } from '@aicr/orbs';
import manifest from './orb-manifest.json';

export function Layout({ children }) {
  return (
    <OrbProvider manifest={manifest}>
      {children}
      <AIDock />
    </OrbProvider>
  );
}
```

---

## API Endpoints

### Platform APIs (AICR)

| Endpoint | Purpose |
|----------|---------|
| `GET /api/orbs/catalog` | List all platform orbs |
| `GET /api/orbs/:orb/schema` | Get orb definition |
| `POST /api/orbs/register` | Register app manifest on deploy |
| `GET /api/orbs/health` | Health check for all orbs |
| `WS /api/orbs/signals` | Real-time signal stream |
| `GET /api/orbs/signals/history` | Signal history (REST) |

### App APIs (Per-Orb)

| Orb | Endpoints |
|-----|-----------|
| **Ask** | `POST /api/ai/ask/stream`, `GET /api/ai/ask/conversations` |
| **Ops** | `GET /api/ai/ops/alerts`, `POST /api/ai/ops/acknowledge` |
| **Pulse** | `GET /api/ai/pulse/recommendations`, `POST /api/ai/pulse/dismiss` |
| **Tasks** | `GET /api/tasks`, `POST /api/tasks`, `PATCH /api/tasks/:id` |
| **KB** | `GET /api/kb/search`, `GET /api/kb/docs/:id` |

---

## Migration Plan

### Phase 1: Package Creation
- [ ] Create `@aicr/orbs` package in AICR monorepo
- [ ] Define orb catalog (YAML schemas)
- [ ] Build AI Dock component
- [ ] Build base orb components (Ask, Ops, Pulse, Tasks, KB)

### Phase 2: AICR Integration
- [ ] Wire orbs to existing AICR APIs
- [ ] Implement WebSocket signal streaming
- [ ] Build orb registration endpoint
- [ ] Add orb management to AICR admin

### Phase 3: App Migration
- [ ] Create `orb-manifest.json` template
- [ ] Migrate sgm-sparcc-demo (pilot)
- [ ] Migrate remaining demos
- [ ] Remove deprecated orb implementations

### Phase 4: User Settings
- [ ] Build AI Dock settings UI
- [ ] Implement user preference sync
- [ ] Add position/visibility controls

---

## Apps to Migrate

| App | Priority | Notes |
|-----|----------|-------|
| sgm-sparcc-demo | High | Pilot migration |
| rcm-sparcc-demo | High | Similar to SGM |
| np-edge-demo | Medium | Different Ask naming |
| ps-edge-demo | Medium | Different Ask naming |
| vms-edge-demo | Medium | Has OrgChiefOrb (needs review) |
| lumen-summit-demo | Low | UI-only, no backend |

---

## Success Criteria

- [ ] Single `@aicr/orbs` package consumed by all apps
- [ ] All 5 orbs functional: Ask, Ops, Pulse, Tasks, KB
- [ ] AI Dock UI with macOS-style interactions
- [ ] User-configurable dock position (left/bottom/right)
- [ ] Real-time signals via WebSocket
- [ ] Orb management visible in AICR admin dashboard
- [ ] Zero divergent orb implementations in app repos

---

## Decisions Log

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Configuration model | Hybrid (platform + app) | Consistency with flexibility |
| Signal delivery | WebSocket + REST | Real-time + history access |
| Manifest location | App repo + sync to AICR | Version control + visibility |
| Custom orbs | Not allowed | Enforce platform consistency |
| UI pattern | AI Dock (macOS-style) | Familiar, elegant, scalable |
| Interaction modes | Panel + Page | Quick access + deep work |
| Position config | User setting (left/bottom/right) | User preference |

---

**Approved:** 2026-01-25
**Next Step:** Implementation planning with `superpowers:writing-plans`
