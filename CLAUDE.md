# SGM-SPARCC Demo - AI Agent Instructions

> **This file is auto-read by Claude Code at session start.**
> Last updated: January 2026

## What Is This?

**SGM (Sales Governance Manager)** is a Next.js 14+ demo showcasing enterprise governance for sales compensation programs. It demonstrates the **Contracts + Ports + Bindings** architecture pattern with governance UI, policy library, and client dashboards.

## Essential Files to Read

| When Working On | Read This First |
|-----------------|-----------------|
| **Architecture patterns** | `.claude/architecture-context.md` |
| **Project overview** | `.claude/project-context.md` |
| **Policy library** | `lib/data/policies/*.json` (17 SCP policies) |
| **Governance UI** | `app/governance/`, `components/governance/` |

## Recent Major Features

- **Governance UI** - Gap analysis, policy recommendations, document upload
- **Client Dashboard** - Coverage metrics, roadmap, plans per tenant
- **Operational Modes** - Design, Operate, Oversee with mode switching
- **GovLens Integration** - AI-powered governance analysis
- **Policy Library** - 17 SCP policies (Sales Compensation Policies)

## Project Structure

```
app/
├── (home)/               # Landing page
├── client/[tenantSlug]/  # Client dashboards (coverage, gaps, plans)
├── governance/           # Governance UI (upload, analyze)
├── design/               # Design mode landing
├── operate/              # Operate mode landing
├── oversee/              # Oversee mode landing
├── policies/             # Policy library browse
├── documents/            # Document management
├── templates/            # Plan templates
├── approvals/            # Approval workflows
└── api/
    ├── ai/asksgm/        # AI query endpoint
    ├── client/           # Client dashboard APIs
    └── governance/       # Governance analysis APIs

components/
├── governance/           # Gap analysis, document uploader, patch viewer
├── client/               # Dashboard layouts, metrics, coverage matrix
├── plans/                # Plan editor, workflow actions
├── content/              # JSON content renderer
└── modes/                # Mode cards, badges, headers

lib/
├── data/policies/        # 17 SCP JSON policy files
├── governance/           # Policy library, knowledge base
├── services/             # Document parser, gap analysis, GovLens
├── contracts/            # Type contracts (Zod schemas)
└── config/               # Mode themes, module registry

prisma/
├── schema.prisma         # SQLite database schema
└── data/sgm.db           # Local SQLite database
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Next.js 14+ (App Router) |
| **Language** | TypeScript (strict) |
| **Styling** | Tailwind CSS (Summit Navy/Cyan) |
| **Validation** | Zod |
| **Database** | SQLite (local) via Prisma |
| **Icons** | Radix UI icons |
| **AI** | OpenAI (via AICR integration) |

## Database

```
Local SQLite: prisma/data/sgm.db
Migrations: prisma/migrations/
```

**Key Models:**
- ClientEngagement, EngagementPhase
- UploadedDocument, DocumentSection, GapAnalysisResult
- PolicyRecommendation, GovernanceReview
- CompPlan, Policy, MetricDefinition

## Policy Library (SCP-001 to SCP-017)

| Code | Name | Category |
|------|------|----------|
| SCP-001 | Clawback and Recovery | Financial Controls |
| SCP-002 | Quota Management | Performance Management |
| SCP-003 | Windfall and Large Deal | Deal Governance |
| SCP-004 | SPIF Governance | Incentive Programs |
| SCP-005 | Section 409A Compliance | Legal Compliance |
| SCP-006 | State Wage Law Compliance | Legal Compliance |
| SCP-007 | Sales Crediting | Commission Rules |
| SCP-008 | Draws and Guarantees | Financial Controls |
| SCP-009 | Leave of Absence | HR Policies |
| SCP-010 | Mid-Period Change | Plan Administration |
| SCP-011 | Payment Timing | Payroll |
| SCP-012 | Termination and Final Pay | HR Policies |
| SCP-013 | Data and Systems Controls | IT Governance |
| SCP-014 | Territory Management | Territory Rules |
| SCP-015 | Exception and Dispute Resolution | Governance |
| SCP-016 | New Hire and Onboarding | HR Policies |
| SCP-017 | International Requirements | Legal Compliance |

## Development

```bash
# Start dev server (port 3003)
npm run dev

# Build for production
npm run build

# Type check
npm run type-check

# Database
npx prisma studio     # Open Prisma Studio
npx prisma db push    # Push schema changes
```

## Architecture Pattern

**Contracts + Ports + Bindings:**
1. **Contracts** (`lib/contracts/`) - Zod schemas for entities
2. **Ports** (`lib/ports/`) - Service interfaces
3. **Bindings** (`lib/bindings/`) - Provider implementations

**Binding Modes:**
- **Synthetic** - In-memory mock data (default)
- **Mapped** - External API adapters
- **Live** - Prisma database access

## Operational Modes

| Mode | Purpose | Theme |
|------|---------|-------|
| **Design** | Create/edit plans and policies | Blue |
| **Operate** | Day-to-day operations | Green |
| **Oversee** | Governance and compliance | Purple |

## Key Conventions

- **IDs**: lowercase kebab-case
- **Files**: Match ID exactly
- **Variables**: camelCase
- **Types**: PascalCase
- **Interfaces**: IPascalCase
- **Icons**: Radix UI only (no emoji)

## Related Repositories

- **aicr-platform-v3** - Main AICR platform (policies ingested to Spine)
- **sparcc-spm** - SPARCC SPM reference implementation

---

**Port:** 3003
**Demo URL:** localhost:3003
