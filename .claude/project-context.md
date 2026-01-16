# SGM Summit Demo - Project Context

## Project Overview

**sgm-summit-demo** is a standalone Next.js 14+ application demonstrating Summit-tier governance capabilities for sales compensation management. It showcases the **Contracts + Ports + Bindings** architecture pattern with synthetic-first data providers.

## Product Description

**SGM (Sales Governance Manager)** provides enterprise-grade governance for sales compensation programs with these capabilities:

- **Documents + Versioning** - Policy documents with semantic versioning and effective dating
- **Approvals + Workflows** - Multi-level approval chains with state gates
- **Links Graph** - Entity relationships (ConnectItem pattern) with coverage matrices
- **Index/Search** - Full-text search and filtering (IndexItem pattern)
- **Audit Trail** - Append-only logging of all mutations
- **Exports** - Audit packet generation
- **Ingestion** - Import .md and .xlsx files (future)

## Technology Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS (Summit Navy/Cyan theme)
- **Validation**: Zod (runtime + compile-time)
- **Icons**: @radix-ui/react-icons (mandatory)
- **Dates**: date-fns
- **Database**: Prisma ORM (for future live mode)

## Architecture Pattern

**Contracts + Ports + Bindings** (3-layer clean architecture):

1. **Contracts** (`lib/contracts/`) - Entity definitions with Zod schemas
2. **Ports** (`lib/ports/`) - Service interfaces (dependency injection)
3. **Bindings** (`lib/bindings/`) - Provider implementations

**Binding Modes:**
- **Synthetic** (default) - In-memory providers with mock data
- **Mapped** (future) - External API adapters
- **Live** (future) - Prisma database access

## Development

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Type check
npm run type-check
```

## Port

Runs on port **4200** (SGM Summit Demo)

## Key Principles

1. **Synthetic-first** - Zero setup required for demos
2. **Type-safe** - Zod schemas for runtime validation
3. **Clean architecture** - Clear separation of concerns
4. **Summit styling** - Navy/Cyan theme with glass-morphism
5. **Radix icons only** - No emoji, consistent icon system
6. **3-pane layouts** - Nav + List + Detail for document operations
7. **State-gated actions** - Respect document lifecycle (draft/published/superseded)

## Naming Conventions

Follow AICodeRally naming conventions:
- **IDs**: lowercase kebab-case (e.g., `edge-nonprofit-fundraiser`)
- **Files**: Match ID exactly (e.g., `policy.contract.ts`)
- **Variables**: camelCase (e.g., `policyContract`)
- **Types**: PascalCase (e.g., `PolicyContract`)
- **Interfaces**: IPascalCase (e.g., `IPolicyPort`)

## Related Repositories

- **aicoderally-stack** - Monorepo reference for Summit patterns
- **sparcc-spm** - SPARCC SPM reference implementation
- **bhg-edge-demo** - Edge tier demo reference
- **np-edge-demo** - Nonprofit Edge demo reference

## Documentation

See `knowledge/` directory for detailed documentation:
- `architecture/` - Architecture decisions and patterns
- `governance/` - Policy framework and workflows
- `demos/` - Demo scenarios and usage guides

## Status

**Current Phase**: Phase 1 - Repository Foundation (In Progress)

**Next Steps**:
- Phase 2: Contracts & Ports
- Phase 3: Synthetic Providers
- Phase 4: API Routes
- Phase 5: UI Components
- Phase 6: UI Pages
- Phase 7: Documentation & Polish
