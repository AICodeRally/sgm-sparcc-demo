---
route: /operate
title: Operate Mode
description: Execute day-to-day compensation operations and document management.
owner: Platform Team
lastUpdated: 2026-01-17
status: complete
---

# Operate Mode

## Purpose

Operate Mode is the daily execution environment for compensation teams, RevOps, and administrators. It provides tools to manage documents, execute plans, process approvals, and track operational activities.

## When to Use

- **Managing documents**: Upload, review, and track governance documents
- **Processing approvals**: Review and approve pending items in the queue
- **Executing plans**: Track active compensation plans and their status
- **Daily operations**: Calendar management, notifications, and reporting

## Target Users

| Role | Access Level | Primary Activities |
|------|--------------|-------------------|
| SUPER_ADMIN | Full | All operations |
| ADMIN | Full | All operations |
| MANAGER | Full | Document and plan management |
| USER | Limited | Submit and track requests |
| VIEWER | Read-only | View documents and reports |

## Key Metrics

The Operate Control Center displays real-time metrics:

| Metric | Description | Source API |
|--------|-------------|------------|
| Documents | Total governance documents | `/api/sgm/documents` |
| Pending Approvals | Items awaiting review | `/api/sgm/approvals` |
| Active Plans | Currently executing plans | `/api/sgm/plans` |
| Notifications | Unread notifications | `/api/notifications` |

## Primary Features

### Document Library (`/documents`)
Central repository for all governance documents:
- 48+ governance documents with versioning
- Lifecycle management (draft → review → approved → expired)
- Full-text search and filtering
- Document relationships and links

### Plans Management (`/plans`)
Create, review, and modify compensation plans:
- Plan creation wizard
- Status tracking and workflow
- Version history
- Compliance validation

### Approvals Queue (`/approvals`)
Review and approve pending items:
- SGCC (Sales Governance Compliance Committee) workflows
- CRB (Compensation Review Board) workflows
- SLA tracking and alerts
- Bulk approval capabilities

## Secondary Features

### Calendar (`/calendar`)
Schedule and track important dates:
- Review deadlines
- Committee meetings
- Plan effective dates
- Expiration reminders

### Reports (`/reports`)
Generate governance reports:
- Compliance reports
- Activity summaries
- Audit reports
- Custom report builder

### Search & Compare (`/compare`)
Advanced search and comparison tools:
- Compare document versions
- Cross-plan comparison
- Policy coverage analysis

### Notifications (`/notifications`)
Stay updated on important events:
- Approval requests
- Document updates
- Deadline reminders
- System alerts

## Workflow

```
1. Check Notifications for pending items
       ↓
2. Review Approvals Queue
       ↓
3. Process approvals or request changes
       ↓
4. Update Documents as needed
       ↓
5. Track Plans status
       ↓
6. Generate Reports for stakeholders
```

## Technical Details

- **Component**: `app/(app)/operate/page.tsx`
- **Mode Config**: `lib/auth/mode-permissions.ts` → `OperationalMode.OPERATE`
- **Data Fetching**: Client-side via React hooks
- **Dynamic Colors**: Sourced from active module configuration

## Related Pages

- [Document Library](/documents) - Manage documents
- [Plans Management](/plans) - Track compensation plans
- [Approvals Queue](/approvals) - Process approvals
- [Calendar](/calendar) - View schedule
- [Reports](/reports) - Generate reports
- [Dashboard](/dashboard) - Return to mode selection
