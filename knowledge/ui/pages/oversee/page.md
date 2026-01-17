---
route: /oversee
title: Oversee Mode
description: Executive oversight, governance committees, and compliance monitoring.
owner: Platform Team
lastUpdated: 2026-01-17
status: complete
---

# Oversee Mode

## Purpose

Oversee Mode is the executive oversight environment for leadership, committee members, and compliance officers. It provides tools to monitor governance health, manage committees, track decisions, and ensure compliance.

## When to Use

- **Committee management**: Schedule meetings, track decisions, manage members
- **Compliance monitoring**: Review compliance scores and audit findings
- **Executive dashboards**: High-level governance health views
- **Audit preparation**: Review audit trails and compliance documentation

## Target Users

| Role | Access Level | Primary Activities |
|------|--------------|-------------------|
| SUPER_ADMIN | Full | All oversight capabilities |
| ADMIN | Full | All oversight capabilities |

*Note: Oversee Mode is restricted to administrative roles due to the sensitive nature of governance and compliance data.*

## Key Metrics

The Governance & Control Center displays real-time metrics:

| Metric | Description |
|--------|-------------|
| Committees | Active governance committees |
| Meetings | Upcoming committee meetings |
| Decisions | Committee decisions this month |
| Members | Active committee members |
| Compliance | Overall compliance score (%) |

## Primary Features

### Committee Management (`/committees`)
Manage governance committees:
- SGCC (Sales Governance Compliance Committee)
- CRB (Compensation Review Board)
- Member management
- Meeting scheduling
- Decision tracking

### Audit Timeline (`/audit`)
Comprehensive event history:
- All governance actions logged
- Compliance tracking
- Audit trail generation
- Export capabilities

### Governance Analytics (`/analytics`)
Executive dashboards and KPIs:
- Governance health metrics
- Trend analysis
- Risk indicators
- Benchmark comparisons

## Secondary Features

### Decisions Log (`/committees/decisions`)
Record of all committee decisions:
- Decision details and rationale
- Voting records
- Implementation status
- Follow-up tracking

### Compliance Monitor (`/governance-matrix`)
Policy coverage and compliance status:
- Coverage heat maps
- Gap identification
- Risk scoring

### Client Dashboards (`/client/[tenantSlug]`)
Client-specific governance views:
- Coverage analysis
- Gap assessment
- Roadmap tracking

### Risk Assessment (`/analytics?view=risk`)
Governance risk scoring:
- Risk identification
- Mitigation tracking
- Trend analysis

## Active Committees

### Sales Governance Compliance Committee (SGCC)
| Attribute | Value |
|-----------|-------|
| Members | 7 |
| Meeting Frequency | Monthly |
| Responsibilities | Policy approval, compliance oversight, exception review |
| Quorum | 4 members |

### Compensation Review Board (CRB)
| Attribute | Value |
|-----------|-------|
| Members | 5 |
| Meeting Frequency | Bi-weekly |
| Focus | Windfall deals, special exceptions |
| Responsibilities | Exception approvals, special case reviews, policy recommendations |

## Committee Workflow

```
1. Schedule Meeting in Committees
       ↓
2. Prepare Agenda with pending items
       ↓
3. Conduct Meeting (decisions recorded)
       ↓
4. Log Decisions in Decisions Log
       ↓
5. Track Implementation in Audit Timeline
       ↓
6. Report Outcomes in Analytics
```

## Compliance Framework

| Component | Description |
|-----------|-------------|
| Policy Coverage | % of required policies in place |
| Control Effectiveness | Validation of control implementation |
| Audit Findings | Open findings requiring remediation |
| Risk Score | Aggregate governance risk level |

## Technical Details

- **Component**: `app/(app)/oversee/page.tsx`
- **Mode Config**: `lib/auth/mode-permissions.ts` → `OperationalMode.OVERSEE`
- **Theme**: Uses `infra` tone from theme system
- **Dynamic Colors**: Sourced from active module configuration

## Related Pages

- [Committees](/committees) - Manage committees
- [Audit Timeline](/audit) - View audit history
- [Analytics](/analytics) - Governance analytics
- [Compliance](/compliance) - Compliance tracking
- [Decisions](/decisions) - Committee decisions
- [Dashboard](/dashboard) - Return to mode selection
