---
route: /dispute
title: Dispute Mode
description: Resolve exceptions, disputes, and escalations in compensation programs.
owner: Platform Team
lastUpdated: 2026-01-17
status: complete
---

# Dispute Mode

## Purpose

Dispute Mode is the exception handling environment for field teams, managers, and case workers. It provides tools to submit, track, and resolve compensation disputes, territory changes, and special requests.

## When to Use

- **Submitting disputes**: File formal compensation disputes or exception requests
- **Tracking cases**: Monitor status of submitted cases
- **Resolving issues**: Process and close dispute cases (case workers)
- **Analyzing patterns**: Review dispute trends and bottlenecks

## Target Users

| Role | Access Level | Primary Activities |
|------|--------------|-------------------|
| SUPER_ADMIN | Full | All dispute capabilities |
| ADMIN | Full | All dispute capabilities |
| MANAGER | Full | Submit and resolve cases |
| USER | Limited | Submit cases, track own cases |

## Key Metrics

The Dispute Control Center displays real-time metrics:

| Metric | Description |
|--------|-------------|
| Active Cases | Currently open dispute cases |
| High Priority | Urgent cases requiring attention |
| Approaching SLA | Cases nearing SLA deadline |
| Avg Days to Resolve | Average resolution time |

## Primary Features

### Cases Management (`/cases`)
Track and resolve dispute cases:
- Exception requests
- Commission disputes
- Territory change requests
- Special approvals (windfall deals)

### Case SLA & Load (`/cases/sla`)
Monitor SLA compliance and workload:
- SLA tracking by case type
- Compliance monitoring
- Workload optimization
- Agent capacity planning

### Case Analytics (`/cases/analytics`)
Analyze dispute patterns and trends:
- AI-powered predictions
- Trend analysis
- Bottleneck detection
- Capacity planning

## Quick Actions

### Submit Case (`/cases/new`)
Create a new dispute or exception request with supporting documentation.

### My Cases (`/cases?status=pending`)
View and track your submitted cases.

### Escalations (`/cases?priority=high`)
High priority cases requiring immediate attention.

## Common Dispute Types

| Type | Description | Typical SLA |
|------|-------------|-------------|
| Commission Calculation | Disputes over commission amounts | 5 days |
| Territory Change | Requests to modify territory assignments | 5 days |
| Windfall Deal | Large deal exception approvals | 2 days |
| Plan Interpretation | Questions about plan terms | 5 days |
| Credit Disputes | Disputes over deal crediting | 5 days |

## Resolution SLA

| Priority | Target SLA |
|----------|------------|
| Standard | 5 business days |
| Urgent | 2 business days |
| Critical | Same day |

## Workflow

### For Field Users
```
1. Submit Case with documentation
       ↓
2. Track status in My Cases
       ↓
3. Provide additional info if requested
       ↓
4. Receive resolution notification
```

### For Case Workers
```
1. Review Cases Queue
       ↓
2. Prioritize by SLA and priority
       ↓
3. Investigate and gather information
       ↓
4. Make decision or escalate
       ↓
5. Document resolution and close
```

## Technical Details

- **Component**: `app/(app)/dispute/page.tsx`
- **Mode Config**: `lib/auth/mode-permissions.ts` → `OperationalMode.DISPUTE`
- **Case API**: `/api/sgm/cases`
- **Dynamic Colors**: Sourced from active module configuration

## Related Pages

- [Cases Management](/cases) - View all cases
- [Case SLA](/cases/sla) - SLA tracking
- [Case Analytics](/cases/analytics) - Dispute analytics
- [Dashboard](/dashboard) - Return to mode selection
