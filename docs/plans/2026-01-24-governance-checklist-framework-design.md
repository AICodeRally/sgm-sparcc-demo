# Governance Checklist Framework Design

> **Feature:** User-definable governance implementation checklist as a Framework
> **Status:** Approved Design
> **Date:** January 24, 2026

---

## Summary

Add a new framework type ("checklist") to the existing GovernanceFramework system. The first checklist framework is the **Governance Implementation Checklist** (SPM-FW-004) — a 12-phase, 843-step maturity tracker showing the path from no governance to a full Center of Excellence (COE). Includes 5 supplementary reference phases for stakeholder mapping, job descriptions, committee charters, escalation paths, and the Comp Review Board.

Users tailor the checklist to their engagement and track completion per step, acting as a maturity-level tracker through their governance journey.

---

## Data Model

### Schema Changes (GovernanceFramework)

Add two fields to the existing `GovernanceFramework` Prisma model:

```prisma
model GovernanceFramework {
  // ... existing fields ...

  contentType       String   @default("markdown") @map("content_type")
  // "markdown" (existing behavior) | "checklist" (new structured content)

  structuredContent Json?    @map("structured_content")
  // null for markdown-type; ChecklistContent JSON for checklist-type
}
```

### ChecklistContent JSON Shape

```typescript
interface ChecklistContent {
  phases: ChecklistPhase[];
}

interface ChecklistPhase {
  id: string;              // "phase-1"
  number: number;          // 1
  title: string;           // "Foundation & Framework"
  type: 'checklist' | 'reference';  // controls rendering mode
  totalSteps: number;      // 66 (for checklist type)
  items: ChecklistItem[];
}

interface ChecklistItem {
  id: string;              // "item-1"
  number: number;          // 1
  title: string;           // "Overall organizational oversight exists over plan design..."
  steps: ChecklistStep[];
}

interface ChecklistStep {
  id: string;              // "step-1-1"
  number: number;          // 1
  text: string;            // "Conduct stakeholder mapping across all divisions..."
}
```

### New Entity: ChecklistProgress

Per-engagement completion tracking, separate from the framework template.

```prisma
model ChecklistProgress {
  id             String    @id @default(cuid())
  engagementId   String    @map("engagement_id")
  frameworkId    String    @map("framework_id")
  stepId         String    @map("step_id")     // "phase-1.item-1.step-3"
  completed      Boolean   @default(false)
  completedDate  DateTime? @map("completed_date")
  completedBy    String?   @map("completed_by")
  notes          String?

  @@unique([engagementId, frameworkId, stepId])
  @@index([engagementId])
  @@index([frameworkId])
}
```

---

## Framework Entry (SPM-FW-004)

```typescript
{
  id: 'fw-004-id',
  code: 'SPM-FW-004',
  title: 'Governance Implementation Checklist',
  category: 'METHODOLOGY',
  contentType: 'checklist',
  content: '',  // empty for checklist type
  structuredContent: { phases: [...] },  // 17 phases total
  version: '1.0.0',
  status: 'ACTIVE',
  isGlobal: true,
  isMandatory: false,
  applicableTo: ['GOVERNANCE_PLAN'],
  createdBy: 'system',
}
```

### Phase Structure

**Checklist Phases (1-12):** Trackable with checkboxes and progress rings.

| # | Phase Title | Steps | Items |
|---|-------------|-------|-------|
| 1 | Foundation & Framework | 66 | 8 |
| 2 | Legal & Compliance Framework | 64 | 7 |
| 3 | Document Management & Data Infrastructure | 87 | 8 |
| 4 | Core Plan Design Standards | 53 | 6 |
| 5 | Role, Territory & Quota Frameworks | 94 | 10 |
| 6 | Special Programs & Scenarios | 67 | 8 |
| 7 | Calculation & Payment Controls | 61 | 7 |
| 8 | Adjustments & Exceptions Framework | 72 | 8 |
| 9 | Financial Controls & Reconciliation | 59 | 7 |
| 10 | Communication & Rollout | 76 | 8 |
| 11 | Performance Monitoring & KPIs | 43 | 5 |
| 12 | Lifecycle Management & Continuous Improvement | 101 | 10 |

**Reference Phases (13-17):** Read-only content sections, no checkboxes.

| # | Phase Title | Type |
|---|-------------|------|
| 13 | Stakeholder Mapping | reference |
| 14 | Governance Lead Role | reference |
| 15 | Governance Committee | reference |
| 16 | Escalation Paths | reference |
| 17 | Comp Review Board | reference |

---

## UI Design

### Framework Viewer Branching

The existing framework detail page (`governance-framework/[id]/page.tsx`) detects `contentType`:

- `markdown` → existing markdown renderer (no change)
- `checklist` → new `ChecklistFrameworkView` component

### Component Hierarchy

```
ChecklistFrameworkView
├── ProgressHeader           (overall progress bar + maturity level)
├── ViewToggle               (Phase View | Flat View)
├── PhaseView (default)
│   ├── PhaseSidebar         (vertical phase list with completion %)
│   └── PhaseContent
│       ├── ChecklistPhaseCard   (expandable, one per phase)
│       │   └── ChecklistItemGroup   (expandable, one per item)
│       │       └── ChecklistStep    (checkbox + text + metadata)
│       └── ReferencePhaseCard   (expandable, read-only content)
└── FlatView (toggle)
    └── FlatStepList         (all steps in scrollable list, phase headers)
```

### View Modes

**Phase View (default):**
- Left sidebar: phase navigation with completion rings (0-100%)
- Main area: expanded phase showing items and steps
- Click phase in sidebar to scroll/expand that phase
- Checklist phases: checkboxes for each step
- Reference phases: formatted content display (no checkboxes)

**Flat View (toggle):**
- Single scrollable list of all 843 steps
- Phase headers as section dividers
- Supports filtering: by phase, by completion status, by search text
- Power-user mode for scanning everything at once

### Progress Indicators

- **Overall:** "Phase 3 of 12 • 197/843 steps complete (23%)"
- **Per phase:** Completion ring showing % done
- **Per item:** "4/7 steps" badge
- **Step:** Checkbox with completed date when checked

### Client Context

When accessed from `/client/[tenantSlug]/frameworks/[id]`:
- Progress is scoped to that client's engagement
- Checkboxes are interactive (can mark complete)
- Shows who completed each step and when

When accessed from the global framework library (`/governance-framework/[id]`):
- Shows the template structure without progress
- Read-only view of phases, items, steps
- No checkboxes (or disabled checkboxes showing structure only)

---

## API Design

### Existing Endpoints (no changes needed)

```
GET    /api/governance-framework          → List all frameworks (includes checklist)
GET    /api/governance-framework/[id]     → Get framework detail (returns structuredContent)
POST   /api/governance-framework          → Create framework
PUT    /api/governance-framework/[id]     → Update framework
DELETE /api/governance-framework/[id]     → Archive framework
```

### New Progress Endpoints

```
GET    /api/checklist-progress
         ?engagementId=X
         &frameworkId=Y
         &phase=phase-3              (optional: filter by phase)
         &completed=true|false       (optional: filter by completion)
         &search=stakeholder         (optional: text search step text)
  → Returns completed step records for this engagement

POST   /api/checklist-progress
  → Body: { engagementId, frameworkId, stepId, completed, notes? }
  → Toggles a step's completion status
  → Returns updated step record

PATCH  /api/checklist-progress/bulk
  → Body: { engagementId, frameworkId, steps: [{stepId, completed}...] }
  → Bulk update (e.g., "mark all steps in this item complete")
  → Returns updated count

GET    /api/checklist-progress/summary
         ?engagementId=X
         &frameworkId=Y
  → Returns per-phase completion counts for progress bars/rings
  → Shape: { phases: { "phase-1": { total: 66, completed: 42 }, ... }, overall: { total: 843, completed: 197 } }
```

### Data Loading Strategy

1. Framework template (~50KB JSON) loaded once, cacheable
2. Progress data (list of completed step IDs) loaded separately, lightweight
3. Merged client-side: overlay completion state onto template structure
4. Progress updates are optimistic (update UI immediately, POST in background)

---

## Data Conversion

### Source

`~/Downloads/GOVERNANCE_IMPLEMENTATION_CHECKLIST.xlsx`

- 18 sheets: Summary + 12 Phase sheets + 5 Supplementary sheets
- 843 checklist steps across 12 phases (~80 items)
- 5 reference sections with organizational content

### Conversion Script

`scripts/convert-governance-checklist.ts`

1. Read XLSX with `exceljs` library
2. Parse each Phase sheet:
   - Identify "Item N:" rows → items
   - Identify numbered step rows → steps
   - Skip header/summary rows
3. Parse supplementary sheets:
   - Convert to structured items with content as step text
4. Generate `ChecklistContent` JSON
5. Write to `lib/data/synthetic/governance-checklist.json`
6. Update `governance-frameworks.data.ts` to include SPM-FW-004

### Parsing Rules

| Pattern | Meaning |
|---------|---------|
| `PHASE N: TITLE` | Phase header |
| `Item N: description...` | Item start |
| `N. Step text...` | Individual step |
| `Back to summary` | Skip (navigation) |
| Empty rows | Section separators (skip) |
| `Count of total steps` | Skip (metadata) |
| `Completed?` / `Date` | Skip (template columns, not imported) |

---

## Contract Updates

### governance-framework.contract.ts

Add to `GovernanceFrameworkSchema`:

```typescript
contentType: z.enum(['markdown', 'checklist']).default('markdown'),
structuredContent: z.any().nullable().default(null),
// Validated more strictly when contentType === 'checklist':
// ChecklistContentSchema applied conditionally
```

Add new schemas:

```typescript
export const ChecklistStepSchema = z.object({
  id: z.string(),
  number: z.number(),
  text: z.string(),
});

export const ChecklistItemSchema = z.object({
  id: z.string(),
  number: z.number(),
  title: z.string(),
  steps: z.array(ChecklistStepSchema),
});

export const ChecklistPhaseSchema = z.object({
  id: z.string(),
  number: z.number(),
  title: z.string(),
  type: z.enum(['checklist', 'reference']),
  totalSteps: z.number(),
  items: z.array(ChecklistItemSchema),
});

export const ChecklistContentSchema = z.object({
  phases: z.array(ChecklistPhaseSchema),
});
```

### New contract: checklist-progress.contract.ts

```typescript
export const ChecklistProgressSchema = z.object({
  id: z.string(),
  engagementId: z.string(),
  frameworkId: z.string(),
  stepId: z.string(),
  completed: z.boolean(),
  completedDate: z.string().nullable(),
  completedBy: z.string().nullable(),
  notes: z.string().nullable(),
});
```

---

## Implementation Sequence

| # | Task | Dependencies |
|---|------|-------------|
| 1 | Schema update: add `contentType`, `structuredContent` to Prisma | — |
| 2 | Contract update: extend GovernanceFramework + add Checklist schemas | — |
| 3 | Conversion script: XLSX → JSON | — |
| 4 | Synthetic binding: load SPM-FW-004 with structured content | 2, 3 |
| 5 | API update: framework GET returns `structuredContent` | 2 |
| 6 | Live binding: update Prisma queries for new fields | 1, 2 |
| 7 | Viewer branch: detect `contentType`, render checklist UI | 4, 5 |
| 8 | Checklist components: Phase/Item/Step hierarchy with expand/collapse | 7 |
| 9 | Flat view: toggle + filtering + search across all steps | 8 |
| 10 | ChecklistProgress entity: schema + contract + port + bindings | 1 |
| 11 | Progress API: CRUD + bulk + summary endpoints | 10 |
| 12 | Progress UI: wire checkboxes to progress API, optimistic updates | 8, 11 |
| 13 | Client integration: scoped progress in client engagement view | 12 |

---

## Content Audit Note

During this design process, a content audit revealed discrepancies in the Design mode landing page:

| Content | UI Claims | Actual | Action |
|---------|-----------|--------|--------|
| Policies | 26 | 26 | No action needed |
| Frameworks | 6 | 3 (will be 4 with this feature) | Address separately |
| Template Sections | 56 | 9 sections across 3 templates | Address separately |

These discrepancies are out of scope for this feature but noted for future work.

---

## Success Criteria

1. SPM-FW-004 appears in the framework library with "checklist" badge
2. Clicking it shows the 17-phase structure with expand/collapse
3. Phase view shows completion rings (0% initially)
4. Flat view shows all 843 steps in a scrollable list with filtering
5. Reference phases (13-17) render as readable content without checkboxes
6. When accessed from a client engagement, checkboxes are interactive
7. Progress persists across sessions (stored in ChecklistProgress)
8. Progress summary shows maturity level ("Phase 3 of 12")
