# Modular Product Architecture Pattern

> **Reference document for LUMEN and SPARCC product lines**
> Created: January 2026

## Overview

This pattern enables selling modules **individually** under a product banner OR **bundled together** as a suite. Used by:

- **LUMEN** (Nonprofit) — Reach, Vault, Board, Grants, etc.
- **SPARCC** (SPM) — Sales Ops, Comp Ops, Revenue Ops, etc.

---

## Monorepo Structure

```
{PRODUCT}/
├── packages/
│   ├── core/                    # Shared infrastructure
│   │   ├── components/          # Shared UI kit
│   │   ├── config/              # Brand, theme tokens
│   │   ├── lib/                 # Utilities, API base
│   │   └── prisma/              # Shared models (tenant, user, audit)
│   │
│   ├── {module-1}/              # First module (standalone capable)
│   │   ├── components/          # Module-specific components
│   │   ├── pages/               # Module routes
│   │   ├── prisma/              # Module data models
│   │   └── package.json         # Module dependencies
│   │
│   ├── {module-2}/              # Second module (standalone capable)
│   │   └── ...
│   │
│   └── {module-n}/              # Additional modules
│       └── ...
│
└── apps/
    ├── {module-1}/              # Standalone deployment of module 1
    ├── {module-2}/              # Standalone deployment of module 2
    └── suite/                   # Full product suite (all modules)
```

---

## LUMEN Example (Nonprofit)

```
LUMEN/
├── packages/
│   ├── core/                    # Shared: auth, brand, UI
│   ├── reach/                   # CRM module
│   ├── vault/                   # Knowledge archive module
│   ├── board/                   # Governance module
│   ├── grants/                  # Grant management module
│   ├── compliance/              # Audit/compliance module
│   ├── funds/                   # Fund accounting module
│   └── impact/                  # Program outcomes module
│
└── apps/
    ├── reach/                   # Standalone CRM
    ├── vault/                   # Standalone Library
    ├── board/                   # Standalone Governance
    └── suite/                   # Full LUMEN suite
```

---

## SPARCC Example (SPM)

```
SPARCC/
├── packages/
│   ├── core/                    # Shared: auth, brand, UI
│   ├── sales-ops/               # Sales operations module
│   ├── comp-ops/                # Compensation operations module
│   ├── revenue-ops/             # Revenue operations module
│   ├── territory/               # Territory management module
│   ├── quota/                   # Quota management module
│   └── analytics/               # SPM analytics module
│
└── apps/
    ├── sales-ops/               # Standalone Sales Ops
    ├── comp-ops/                # Standalone Comp Ops
    └── suite/                   # Full SPARCC suite
```

---

## Core Package Contents

The `core` package provides shared infrastructure:

### Authentication & Tenancy
```typescript
// packages/core/lib/auth/
- nextauth.config.ts     // NextAuth configuration
- tenant.middleware.ts   // Tenant isolation
- rbac.ts                // Role-based access control
```

### Brand & Theming
```typescript
// packages/core/config/
- brand.config.ts        // Colors, gradients, typography
- theme.tokens.ts        // CSS custom properties
- navigation.config.ts   // Shared nav patterns
```

### Shared UI Components
```typescript
// packages/core/components/
- layout/                // Navbar, Sidebar, AppLayout
- ui/                    // Card, Button, Table, Modal, Form
- ai/                    // AI orbs (optional)
- command-palette/       // Global search (Cmd+K)
```

### Shared Data Models
```prisma
// packages/core/prisma/
model Tenant { ... }
model User { ... }
model AuditLog { ... }
model Entitlement { ... }
```

---

## Entitlement System

Each tenant has module-level entitlements:

```typescript
type ProductEntitlement = {
  [moduleSlug: string]: boolean;
}

// LUMEN example
const lumenEntitlements: ProductEntitlement = {
  reach: true,      // CRM enabled
  vault: true,      // Library enabled
  board: false,     // Governance not purchased
  grants: false,    // Grants not purchased
}

// SPARCC example
const sparccEntitlements: ProductEntitlement = {
  'sales-ops': true,
  'comp-ops': true,
  'revenue-ops': false,
}
```

### Pricing Tiers

```typescript
const PRODUCT_TIERS = {
  starter: ['module-1'],                           // Single module
  professional: ['module-1', 'module-2'],          // 2 modules
  enterprise: ['module-1', 'module-2', 'module-3'], // Full suite
}

// LUMEN tiers
const LUMEN_TIERS = {
  starter: ['reach'],
  professional: ['reach', 'vault'],
  enterprise: ['reach', 'vault', 'board', 'grants', 'compliance'],
}

// SPARCC tiers
const SPARCC_TIERS = {
  starter: ['sales-ops'],
  professional: ['sales-ops', 'comp-ops'],
  enterprise: ['sales-ops', 'comp-ops', 'revenue-ops', 'territory', 'quota'],
}
```

---

## UI Pattern Guidance

### Module-Appropriate UI

| UI Pattern | Best For | Source Reference |
|------------|----------|------------------|
| Collapsible sidebar | CRM, relationship-focused | Edge demos (np-edge, ps-edge) |
| Three-pane workspace | Document vault, policies | SGM-SPARCC (documents, committees) |
| Committee management | Board governance, decisions | SGM-SPARCC (committees) |
| Pipeline/Kanban | Sales, grants, workflows | PS-Edge (pipeline) |
| Dashboard cards | Analytics, KPIs | Both patterns |

### When to Use Each

**Edge Pattern (Collapsible Sidebar):**
- Relationship management (contacts, orgs)
- List-heavy workflows
- Simple CRUD operations
- Mobile-friendly requirements

**SGM Pattern (Three-Pane Workspace):**
- Document/policy management
- Complex detail views with context actions
- Role-based content variations
- Governance workflows with approvals

---

## Cross-Module Features

When running as a suite, modules share:

### Global Search
```typescript
// Search across all enabled modules
const searchResults = await globalSearch(query, {
  modules: tenant.enabledModules,
  limit: 20,
});
```

### Unified Navigation
```typescript
// Suite navigation shows all enabled modules
const navigation = enabledModules.map(mod => ({
  label: mod.displayName,
  icon: mod.icon,
  href: `/${mod.slug}`,
  color: mod.themeColor,
}));
```

### Cross-Module Linking
```typescript
// Link entities across modules
// e.g., Vault asset linked to Board packet
// e.g., Reach contact linked to Grant application
```

### Shared Audit Trail
```typescript
// All module actions logged to central audit
await auditLog.record({
  module: 'reach',
  action: 'contact.created',
  entityId: contact.id,
  userId: session.user.id,
  tenantId: session.tenant.id,
});
```

---

## Deployment Options

### Standalone Module
```bash
# Deploy just Reach CRM
cd apps/reach
pnpm build && pnpm start
```

### Full Suite
```bash
# Deploy full LUMEN suite
cd apps/suite
pnpm build && pnpm start
```

### Module Add-On
```bash
# Existing Reach customer adds Vault
# 1. Update tenant entitlements
# 2. Run migrations for vault models
# 3. Vault routes become accessible
```

---

## Development Workflow

### Adding a New Module

1. **Create package structure:**
   ```bash
   mkdir -p packages/{module-name}/{components,pages,prisma}
   ```

2. **Define module manifest:**
   ```typescript
   // packages/{module-name}/manifest.ts
   export const MODULE_MANIFEST = {
     slug: 'module-name',
     displayName: 'Module Name',
     description: 'What this module does',
     icon: 'IconName',
     themeColor: 'amber-500',
     routes: ['/module-name', '/module-name/*'],
     dependencies: ['core'],
   }
   ```

3. **Add Prisma models:**
   ```prisma
   // packages/{module-name}/prisma/schema.prisma
   model ModuleEntity {
     id        String   @id @default(cuid())
     tenantId  String
     // ... fields
   }
   ```

4. **Create standalone app:**
   ```bash
   mkdir -p apps/{module-name}
   # Wire up Next.js app importing from packages/core + packages/{module-name}
   ```

5. **Register in suite:**
   ```typescript
   // apps/suite/modules.config.ts
   import { MODULE_MANIFEST } from '@lumen/module-name';
   ```

---

## Related Projects

| Project | Path | Purpose | Status |
|---------|------|---------|--------|
| **LUMEN** | ~/dev/LUMEN | Nonprofit product line | NEW - use modular pattern |
| **SPARCC** | ~/dev/SPARCC | SPM product line | NEW - supersedes sparcc-spm |
| sparcc-spm | ~/dev/sparcc-spm | Legacy SPM code | SUPERSEDED - reference only |
| SGM-SPARCC Demo | ~/dev/sgm-sparcc-demo | UI pattern reference | ACTIVE |
| PS-Edge Demo | ~/dev/ps-edge-demo | Edge pattern reference | ACTIVE |
| NP-Edge Demo | ~/dev/np-edge-demo | Nonprofit Edge reference | ACTIVE |
| AICR | ~/dev/aicr | Platform infrastructure | ACTIVE |

---

## Next Steps

### For LUMEN
1. Create ~/dev/LUMEN with this structure
2. Start with `packages/core` + `packages/reach`
3. Use Edge patterns for CRM UI
4. Add Vault using SGM patterns
5. Port Board from SGM committees

### For SPARCC
1. Apply same structure to ~/dev/sparcc-spm
2. Define module boundaries (sales-ops, comp-ops, revenue-ops)
3. Port relevant SGM patterns
4. Create standalone + suite apps
