# SPARCC Module Configuration Guide

## 🎯 Overview

SPARCC uses a **module system** to support multiple product lines with distinct color schemes and branding. Each deployment is configured to use exactly **one module** via environment variables at build/deployment time.

This is a **deployment-time configuration**, not a runtime setting. Think of it like infrastructure configuration: one deployment = one module.

---

## 🚀 Quick Start

### Setting Your Module

1. **Copy the example environment file:**
   ```bash
   cp .env.example .env.local
   ```

2. **Edit `.env.local` and set your module:**
   ```bash
   NEXT_PUBLIC_SPARCC_MODULE=sgm
   ```

3. **Restart the dev server:**
   ```bash
   npm run dev
   ```

That's it! Your application now uses the specified module's colors and branding.

---

## 📦 Available Modules

### SGM - Sales Governance Management (Default)
```
Module ID:     sgm
Product Line:  SPARCC for Sales
Tagline:       for Sales
Version:       1.0.0
Gradient:      Blue→Purple (Cyan → Blue → Indigo → Violet)

Colors:
  #0ea5e9  Cyan-500   (OVERSEE mode)
  #3b82f6  Blue-500   (DISPUTE mode)
  #6366f1  Indigo-500 (OPERATE mode)
  #8b5cf6  Violet-500 (DESIGN mode)

Data Entities:
  Plan, Policy, Document, Case, Approval, Committee

Use Cases:
  - Sales compensation governance
  - Policy management
  - Compensation plan design
```

### SPARCC Enterprise Sales
```
Module ID:     sparcc-sales
Product Line:  SPARCC for Enterprise
Tagline:       for Enterprise: Sales
Version:       2.0.0
Gradient:      Yellow spectrum

Colors:
  #eab308  Yellow-500 (OVERSEE)
  #ca8a04  Yellow-600 (DISPUTE)
  #a16207  Yellow-700 (OPERATE)
  #854d0e  Yellow-800 (DESIGN)

Data Entities:
  Territory, Quota, Deal, Commission, Performance

Use Cases:
  - Enterprise sales operations
  - Territory planning
  - Quota optimization
```

### SPARCC Enterprise Finance
```
Module ID:     sparcc-finance
Product Line:  SPARCC for Enterprise
Tagline:       for Enterprise: Finance
Version:       2.0.0
Gradient:      Orange spectrum

Colors:
  #f97316  Orange-500 (OVERSEE)
  #ea580c  Orange-600 (DISPUTE)
  #c2410c  Orange-700 (OPERATE)
  #9a3412  Orange-800 (DESIGN)

Data Entities:
  Budget, Forecast, Transaction, Account, Report

Use Cases:
  - Financial operations
  - Budget management
  - Variance analysis
```

---

## 🎨 Color System

### How Color Distribution Works

Each module defines a **gradient** (2-7 colors). These colors are automatically distributed to the 4 operational modes using **linear RGB interpolation**:

```
Position 0.0  → OVERSEE (monitoring foundation)
Position 0.33 → DISPUTE (exception handling)
Position 0.67 → OPERATE (day-to-day operations)
Position 1.0  → DESIGN (strategic framework)
```

This ensures:
- ✅ Consistent visual hierarchy across all modules
- ✅ Automatic color harmony (no manual tuning)
- ✅ Scalable to unlimited modules
- ✅ Mathematical precision

### What Changes When You Switch Modules

| UI Element | Uses Module Colors |
|------------|-------------------|
| **Navbar SPARCC Logo** | Full gradient |
| **Navbar Tagline** | Module-specific text |
| **SGM Circle** | Full gradient |
| **Homepage Background** | Subtle gradient (10-15% opacity) |
| **Homepage Title** | Full gradient text |
| **Mode Landing Pages** | Mode-specific color (15-30% opacity backgrounds) |
| **Metric Cards** | Mode-specific borders and text (30% opacity borders) |
| **Quick Access Hover** | Mode-specific highlights |

---

## 🏗️ Deployment Patterns

### Pattern 1: Single-Tenant Deployment (Recommended)

**One deployment = One module**

Each deployment is dedicated to a single product module.

```bash
# Production environment variables
NEXT_PUBLIC_SPARCC_MODULE=sgm

# Example deployments:
# sgm.example.com         → SGM module
# finance.example.com     → Finance module
# sales-enterprise.com    → Sales module
```

**Advantages:**
- ✅ Simple configuration
- ✅ Clear separation of products
- ✅ Easy to scale independently
- ✅ No runtime complexity

**Use Cases:**
- White-label deployments for different clients
- Separate products for different market segments
- Independent scaling requirements

### Pattern 2: Multi-Tenant SaaS (Future Enhancement)

**Multiple tenants, each with their own module**

For SaaS platforms where different organizations (tenants) use different SPARCC modules:

```sql
-- Database schema (future)
ALTER TABLE tenants ADD COLUMN module_id VARCHAR(50) DEFAULT 'sgm';

-- Example data:
-- the Company       → sgm
-- Acme Corp Finance  → sparcc-finance
-- Enterprise Sales   → sparcc-sales
```

**Implementation approach:**
1. Add `module_id` column to tenants table
2. Read module from database at request time (in middleware)
3. Inject module context into request headers
4. Pages/components read from injected context

**This requires code changes** - not yet implemented. Current implementation uses environment variables only.

### Pattern 3: Development/Testing

**Local testing with multiple modules**

```bash
# .env.local (not committed)
NEXT_PUBLIC_SPARCC_MODULE=sparcc-finance

# Switch modules by editing .env.local and restarting dev server
```

**Dev-Only Tools:**
- `/test-module` page - Visual module preview (keep for development)
- `setActiveModule()` function - Marked as deprecated, dev/testing only

---

## 🔧 Configuration Details

### Environment Variable

**Variable Name:**
```bash
NEXT_PUBLIC_SPARCC_MODULE
```

**Must be `NEXT_PUBLIC_`** because:
- Read by client-side components (Navbar, mode pages)
- Next.js requires `NEXT_PUBLIC_` prefix for client access
- Build-time configuration (baked into the bundle)

**Valid Values:**
- `sgm` (default)
- `sparcc-sales`
- `sparcc-finance`
- Any module ID registered in `/lib/config/module-registry.ts`

**Validation:**
- If variable is not set → defaults to `sgm`
- If invalid value → logs warning and falls back to `sgm`
- Validated at startup in `module-registry.ts`

### Module Registry Location

Modules are defined in:
```
/lib/config/module-registry.ts
```

To add a new module:
1. Define a `ModuleConfig` object
2. Add to `availableModules` map
3. No other code changes needed

---

## 🚫 What NOT To Do

### ❌ Don't Switch Modules at Runtime in Production

**Why this is wrong:**
- Module is global state affecting ALL users
- Requires page reload to apply colors
- Confusing user experience
- Not multi-tenant safe

**The old approach (now deprecated):**
```typescript
// ❌ DEPRECATED - Don't do this in production
setActiveModule('sparcc-finance');
window.location.reload();
```

**The correct approach:**
```bash
# ✅ Set via environment variable
NEXT_PUBLIC_SPARCC_MODULE=sparcc-finance

# Then rebuild/redeploy
npm run build
```

### ❌ Don't Build "Admin Module Switcher" UI

**Why:**
- It's not an admin function, it's infrastructure configuration
- Affects all users globally (not per-user or per-session)
- Should be set at deployment time, not runtime
- Use environment variables or database (for multi-tenant)

**Exception:**
- The `/test-module` page is fine for **local development only**
- Clearly marked as dev-only
- Not accessible in production

---

## 🧪 Testing Module Changes

### Local Development

1. **Edit `.env.local`:**
   ```bash
   NEXT_PUBLIC_SPARCC_MODULE=sparcc-finance
   ```

2. **Restart dev server:**
   ```bash
   npm run dev
   ```

3. **Verify changes:**
   - Check navbar tagline: "for Enterprise: Finance"
   - Check colors: Orange gradient instead of blue-purple
   - Navigate to `/design`, `/operate`, etc. - backgrounds should be orange

### Test Page (Dev Only)

Visit `/test-module` to see:
- Current module configuration
- Gradient visualization
- Mode color distribution
- Module metadata

**Important:** This page should not be accessible in production. It's for development/testing only.

### Production Deployment

```bash
# Vercel
vercel env add NEXT_PUBLIC_SPARCC_MODULE production
# Enter value: sparcc-finance

# Then redeploy
vercel --prod

# Or set in Vercel dashboard:
# Project Settings → Environment Variables
# Add NEXT_PUBLIC_SPARCC_MODULE = sparcc-finance
```

---

## 📊 Visual Comparison

### SGM Module (Blue-Purple)
```
#0ea5e9  ████████  Cyan-500   (OVERSEE)   Fresh, clear
#3b82f6  ████████  Blue-500   (DISPUTE)   Trust, stable
#6366f1  ████████  Indigo-500 (OPERATE)   Professional
#8b5cf6  ████████  Violet-500 (DESIGN)    Creative, strategic
```

### Finance Module (Orange)
```
#f97316  ████████  Orange-500 (OVERSEE)   Bright, energetic
#ea580c  ████████  Orange-600 (DISPUTE)   Warm, balanced
#c2410c  ████████  Orange-700 (OPERATE)   Rich, grounded
#9a3412  ████████  Orange-800 (DESIGN)    Deep, strategic
```

### Sales Module (Yellow)
```
#eab308  ████████  Yellow-500 (OVERSEE)   Bright, optimistic
#ca8a04  ████████  Yellow-600 (DISPUTE)   Warm, confident
#a16207  ████████  Yellow-700 (OPERATE)   Solid, reliable
#854d0e  ████████  Yellow-800 (DESIGN)    Rich, prestigious
```

---

## 🔮 Adding New Modules

### Step 1: Define Module Configuration

Edit `/lib/config/module-registry.ts`:

```typescript
const newModule: ModuleConfig = {
  module: {
    id: 'sparcc-marketing',
    name: 'Marketing',
    productLine: 'SPARCC for Enterprise',
    tagline: 'for Enterprise: Marketing',
    version: '2.0.0',
  },
  gradient: {
    start: '#16a34a',    // green-600
    mid1: '#15803d',     // green-700
    mid2: '#166534',     // green-800
    end: '#14532d',      // green-900
    tailwindClass: 'from-green-600 via-green-700 via-green-800 to-green-900',
  },
  modeColors: distributeGradientToModes({
    start: '#16a34a',
    mid1: '#15803d',
    mid2: '#166534',
    end: '#14532d',
    tailwindClass: '',
  }),
  data: {
    entities: ['Campaign', 'Lead', 'Conversion', 'Attribution'],
    apiVersion: 'v2',
    databaseSchema: 'enterprise_marketing',
    apiBasePath: '/api/v2',
  },
  ai: {
    agents: ['CAMPAIGN_OPTIMIZER', 'ATTRIBUTION_ANALYST'],
    features: ['campaign-optimization', 'lead-scoring'],
  },
};
```

### Step 2: Register Module

```typescript
const availableModules = {
  sgm: sgmModule,
  'sparcc-sales': sparccEnterpriseSales,
  'sparcc-finance': sparccEnterpriseFinance,
  'sparcc-marketing': newModule,  // ← Add here
};
```

### Step 3: Deploy with New Module

```bash
NEXT_PUBLIC_SPARCC_MODULE=sparcc-marketing npm run build
```

That's it! No changes to pages, components, or logic needed.

---

## 🎓 Architecture Design Decisions

### Why Environment Variables?

**Alternatives considered:**

1. **Runtime Admin Toggle** ❌
   - Global state affects all users
   - Requires page reload
   - Not multi-tenant safe
   - Confuses deployment vs. configuration

2. **Database Configuration** ⚠️
   - Good for multi-tenant SaaS
   - Adds complexity for single-tenant
   - Requires migration strategy
   - Future enhancement, not current implementation

3. **Environment Variables** ✅
   - Simple and standard
   - Clear separation: one deployment = one module
   - No runtime complexity
   - Works with all deployment platforms
   - Easy to understand and debug

### Why Not Per-User Module Selection?

Modules define **entire product branding**:
- Color scheme (affects entire UI)
- Data entities (different domains)
- AI agents (different capabilities)
- API versions (different contracts)

This is **product-level configuration**, not user preference.

**Analogy:** You don't let Gmail users switch to Google Docs UI within Gmail. They're different products.

### Multi-Tenant Future

For SaaS where tenants use different modules:
- Store `module_id` in `tenants` table
- Read at request time (middleware)
- Each tenant sees their module
- Requires code changes (not yet implemented)

This is **infrastructure work**, not a simple toggle.

---

## 📚 Reference

### Files Modified for Module System

**Core Configuration:**
- `/lib/config/module-registry.ts` - Module definitions
- `/lib/config/color-distribution.ts` - Color algorithm
- `/lib/auth/mode-permissions.ts` - Dynamic MODE_CONFIGS

**UI Components:**
- `/components/Navbar.tsx` - Module branding
- `/app/page.tsx` - Homepage colors
- `/app/design/page.tsx` - Mode landing page
- `/app/operate/page.tsx` - Mode landing page
- `/app/dispute/page.tsx` - Mode landing page
- `/app/oversee/page.tsx` - Mode landing page

**Configuration:**
- `.env.example` - Environment variable documentation

### Type Definitions

```typescript
// /types/module-config.ts
export interface ModuleConfig {
  module: {
    id: string;
    name: string;
    productLine: string;
    tagline: string;
    version: string;
  };
  gradient: ModuleGradient;
  modeColors: ModeModeColors;
  data: ModuleDataConfig;
  ai?: ModuleAIConfig;
  lookAndFeel?: ModuleLookAndFeel;
}
```

### Key Functions

```typescript
// Get active module (reads from env)
const activeModule = getActiveModule();

// Get all available modules
const allModules = getAllModules();

// Check if module exists
const exists = moduleExists('sparcc-finance');

// DEPRECATED - Dev/testing only
setActiveModule('sparcc-finance'); // ⚠️ Not for production
```

---

## 🐛 Troubleshooting

### Module not changing after editing .env.local

**Solution:** Restart the dev server
```bash
# Stop the server (Ctrl+C)
npm run dev
```

Environment variables are read at startup, not hot-reloaded.

### Invalid module ID in env var

**Symptoms:**
- Console warning: `Invalid module 'xyz' in NEXT_PUBLIC_SPARCC_MODULE`
- Falls back to SGM (default)

**Solution:** Check spelling in `.env.local`
```bash
# Valid values:
NEXT_PUBLIC_SPARCC_MODULE=sgm
NEXT_PUBLIC_SPARCC_MODULE=sparcc-sales
NEXT_PUBLIC_SPARCC_MODULE=sparcc-finance
```

### Colors not updating after module change

**Possible causes:**
1. Didn't restart dev server
2. Browser cached old CSS
3. Looking at static page without dynamic colors

**Solutions:**
1. Restart dev server: `npm run dev`
2. Hard refresh browser: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
3. Check browser console for errors

### ModuleSwitcher component not working

**This is expected!** The ModuleSwitcher has been removed from production code.

**For development testing:**
- Use `.env.local` to set module
- Visit `/test-module` to preview modules
- Don't expect runtime switching in production

---

## 🚢 Production Checklist

Before deploying:

- [ ] Set `NEXT_PUBLIC_SPARCC_MODULE` in production environment
- [ ] Verify module ID is valid (sgm, sparcc-sales, or sparcc-finance)
- [ ] Test all 4 mode pages (/design, /operate, /dispute, /oversee)
- [ ] Verify navbar shows correct tagline
- [ ] Check that gradient colors appear correctly
- [ ] Remove or protect `/test-module` page (dev only)
- [ ] Ensure `.env.local` is in `.gitignore` (don't commit)

---

## 📞 Support

**Questions about module configuration?**
1. Check this guide first
2. Review `/lib/config/module-registry.ts` for module definitions
3. Test with `/test-module` page in development
4. Check browser console for warnings/errors

**Adding a new module?**
- Follow "Adding New Modules" section above
- Ensure gradient has 2-7 colors
- Test color distribution looks good
- Verify all 4 mode pages render correctly

---

*Last updated: January 2026*
*Module System Version: 2.0*

## See also
- `docs/KB_OVERVIEW.md`
- `docs/KB_PAGE_INDEX.md`
- Relevant KB routes: /settings/module, /design, /operate, /dispute, /oversee
