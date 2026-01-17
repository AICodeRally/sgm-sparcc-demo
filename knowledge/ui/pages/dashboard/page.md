---
route: /dashboard
title: Dashboard
description: Central hub for navigating the 4 operational modes of Sales Governance Manager.
owner: Platform Team
lastUpdated: 2026-01-17
status: complete
---

# Dashboard

## Purpose

The Dashboard is the primary navigation hub for SGM, presenting the platform's 4-mode operational structure. It provides at-a-glance metrics for each mode and enables users to quickly enter their relevant workflow context.

## When to Use

- **Starting your session**: Begin here to choose your operational context
- **Switching contexts**: Return here to transition between modes (Design, Operate, Dispute, Oversee)
- **Quick health check**: View key metrics across all modes without drilling into each section

## 4 Operational Modes

### Design Mode
**Tagline**: Design governance frameworks and policies

Build compensation frameworks, policies, and templates. Used by consultants, CoE teams, and governance architects.

| Feature | Description |
|---------|-------------|
| Policy Library | Create and manage governance policies |
| Plan Templates | Build reusable compensation plan templates |
| Governance Framework | Define organizational governance structure |
| Governance Matrix | Map controls to frameworks |
| Framework Primer | Onboarding guide for frameworks |

**Routes**: `/design`, `/templates`, `/policies`, `/governance-framework`, `/governance-matrix`

---

### Operate Mode
**Tagline**: Execute compensation plans and workflows

Day-to-day compensation operations. Used by compensation teams, RevOps, and administrators.

| Feature | Description |
|---------|-------------|
| Document Library | Manage all governance documents |
| Plans Management | Execute and track compensation plans |
| Approvals Queue | Review and approve pending items |
| Calendar | View upcoming reviews and deadlines |
| Reports & Analytics | Generate operational reports |

**Routes**: `/operate`, `/documents`, `/plans`, `/approvals`, `/calendar`, `/reports`

---

### Dispute Mode
**Tagline**: Resolve disputes and manage exceptions

Exception and dispute resolution workflows. Used by field teams, managers, and case workers.

| Feature | Description |
|---------|-------------|
| Cases Management | Track and resolve dispute cases |
| Case SLA | Monitor SLA compliance |
| Case Analytics | Analyze dispute patterns |
| Escalation Workflows | Manage escalation paths |

**Routes**: `/dispute`, `/cases`, `/cases/sla`, `/cases/analytics`

---

### Oversee Mode
**Tagline**: Monitor governance and compliance

Executive oversight and compliance monitoring. Used by executives and committee members.

| Feature | Description |
|---------|-------------|
| Committee Management | Manage governance committees |
| Audit Timeline | Track audit activities |
| Compliance Monitoring | Monitor compliance status |
| Committee Decisions | Record and track decisions |

**Routes**: `/oversee`, `/committees`, `/audit`, `/analytics`, `/compliance`, `/decisions`

## Key Metrics

The dashboard fetches live metrics from the following APIs:

| Metric Category | Source API | Examples |
|-----------------|------------|----------|
| Documents | `/api/sgm/documents` | Total count, pending review, expiring soon |
| Policies | `/api/sgm/policies` | Active policies, needs review |
| Approvals | `/api/sgm/approvals` | Pending, overdue, SLA compliance |
| Cases | `/api/sgm/cases` | Active cases, high priority, approaching SLA |

### Stackable Metrics

Each mode card displays 4 metric stacks. Click a metric to rotate through related metrics in that stack. This allows dense information display without overwhelming the UI.

## Role-Based Access

| Role | Design | Operate | Dispute | Oversee |
|------|--------|---------|---------|---------|
| SUPER_ADMIN | Full | Full | Full | Full |
| ADMIN | Full | Full | Full | Full |
| MANAGER | Read-only | Full | Full | - |
| USER | - | Limited | Limited | - |
| VIEWER | - | Read-only | - | - |

## Technical Details

- **Component**: `app/(app)/dashboard/page.tsx`
- **Client-side**: Uses React hooks for live metric fetching
- **Mode Cards**: `components/modes/ModeCard.tsx`
- **Color System**: Dynamic colors from active module configuration

## Related

- [Design Mode](/design) - Enter Design context
- [Operate Mode](/operate) - Enter Operate context
- [Dispute Mode](/dispute) - Enter Dispute context
- [Oversee Mode](/oversee) - Enter Oversee context
- [Settings](/settings) - Configure user preferences
