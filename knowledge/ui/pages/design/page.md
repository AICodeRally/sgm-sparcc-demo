---
route: /design
title: Design Mode
description: Build governance frameworks, policies, and templates for sales compensation programs.
owner: Platform Team
lastUpdated: 2026-01-17
status: complete
---

# Design Mode

## Purpose

Design Mode is the authoring environment for governance architects, consultants, and Center of Excellence (CoE) teams. It provides tools to create, maintain, and analyze the foundational governance artifacts that drive compensation programs.

## When to Use

- **Building new governance programs**: Create policies, frameworks, and templates from scratch
- **Updating existing policies**: Revise governance documents during annual reviews
- **Analyzing coverage gaps**: Identify missing policies or framework elements for clients
- **Onboarding new clients**: Assess their current state against governance best practices

## Target Users

| Role | Access Level | Primary Activities |
|------|--------------|-------------------|
| SUPER_ADMIN | Full | All design capabilities |
| ADMIN | Full | All design capabilities |
| MANAGER | Read-only | Review policies and frameworks |

## Key Metrics

The Design Control Center displays real-time metrics:

| Metric | Description |
|--------|-------------|
| Policies | Total governance policies in the library |
| Template Sections | Reusable plan component sections |
| Frameworks | Governance framework pillars defined |
| Plans Analyzed | Client plans reviewed for coverage |

## Primary Features

### Policy Library (`/policies`)
Create and manage governance policies with templates and best practices. Each policy includes:
- Policy statement and rationale
- Compliance requirements
- Related frameworks and controls
- Version history

### Plan Templates (`/templates`)
Build reusable compensation plan templates with modular sections:
- 56 pre-built template sections
- Drag-and-drop section assembly
- Version control and approval workflows
- Client-specific customization

### Governance Framework (`/governance-framework`)
Define the organizational governance structure:
- 6 governance pillars
- 25 policies mapped to pillars
- Compliance mapping and controls
- Framework visualization

## Secondary Features

### Governance Matrix (`/governance-matrix`)
Cross-reference view of policy coverage and approval authorities. Maps which policies apply to which plan types and who approves them.

### Gap Analysis (`/client/[tenantSlug]/gaps`)
Analyze client policy coverage against governance best practices:
- Risk scoring
- Missing policy identification
- Remediation recommendations

### Framework Primer (`/framework/primer`)
Interactive learning module for understanding the governance framework. Useful for onboarding new team members or clients.

### Document Links (`/links`)
Manage relationships between policies, documents, and frameworks. Visualize how governance artifacts connect.

## Workflow

```
1. Review existing policies in Policy Library
       ↓
2. Identify gaps using Gap Analysis
       ↓
3. Create new policies or update existing
       ↓
4. Map policies to Governance Framework
       ↓
5. Build Plan Templates using policies
       ↓
6. Verify coverage in Governance Matrix
```

## Technical Details

- **Component**: `app/(app)/design/page.tsx`
- **Mode Config**: `lib/auth/mode-permissions.ts` → `OperationalMode.DESIGN`
- **Feature Tiles**: `components/modes/FeatureTile.tsx`
- **Dynamic Colors**: Sourced from active module configuration

## Related Pages

- [Policy Library](/policies) - Manage governance policies
- [Plan Templates](/templates) - Build plan templates
- [Governance Framework](/governance-framework) - Define framework structure
- [Governance Matrix](/governance-matrix) - Policy coverage matrix
- [Framework Primer](/framework/primer) - Learn the framework
- [Dashboard](/dashboard) - Return to mode selection
