# SPARCC Enterprise Finance Module - Visual Preview

## 🎨 Color Transformation

When switching from **SGM (Sales Governance)** to **SPARCC Enterprise Finance**, the entire UI updates with a warm orange color scheme.

### Current (SGM) → New (Finance)

| Element | SGM Colors | Finance Colors |
|---------|------------|----------------|
| **Navbar Gradient** | Cyan → Blue → Indigo → Violet | Orange-500 → Orange-600 → Orange-700 → Orange-800 |
| **Navbar Tagline** | "for Sales" | "for Enterprise: Finance" |
| **Homepage Background** | Subtle purple-blue gradient | Subtle orange gradient |
| **Homepage Title** | Cyan-Violet gradient text | Orange-Burnt gradient text |

### Mode Color Distribution

The Finance module's orange gradient automatically distributes to 4 operational modes:

| Mode | Position | SGM Color | Finance Color | Hex Code |
|------|----------|-----------|---------------|----------|
| **OVERSEE** | 0.0 (start) | Cyan #0ea5e9 | Orange-500 #f97316 | Bright orange (monitoring) |
| **DISPUTE** | 0.33 | Blue #3b82f6 | Orange-600 #ea580c | Medium orange (exceptions) |
| **OPERATE** | 0.67 | Indigo #6366f1 | Orange-700 #c2410c | Deep orange (operations) |
| **DESIGN** | 1.0 (end) | Violet #8b5cf6 | Orange-800 #9a3412 | Burnt orange (strategic) |

---

## 📋 Module Configuration Comparison

### SGM (Sales Governance Management)
```
Product Line:  SPARCC for Sales
Module Name:   Sales Governance
Module ID:     sgm
Version:       1.0.0
Tagline:       for Sales

Gradient:
  Start:  #0ea5e9 (cyan-500)
  Mid 1:  #3b82f6 (blue-500)
  Mid 2:  #6366f1 (indigo-500)
  End:    #8b5cf6 (violet-500)

Data Entities:
  Plan, PlanSection, Policy, Document, Case,
  Approval, Committee, GovernanceFramework, Template

AI Agents:
  POLICY_EXPERT, DESIGN, UIUX, KNOWLEDGE_BASE

Features:
  suggestions, gap-analysis, compliance-check,
  risk-scoring, policy-recommendations
```

### SPARCC Enterprise Finance
```
Product Line:  SPARCC for Enterprise
Module Name:   Finance
Module ID:     sparcc-finance
Version:       2.0.0
Tagline:       for Enterprise: Finance

Gradient:
  Start:  #f97316 (orange-500)
  Mid 1:  #ea580c (orange-600)
  Mid 2:  #c2410c (orange-700)
  End:    #9a3412 (orange-800)

Data Entities:
  Budget, Forecast, Transaction, Account, Report

AI Agents:
  FINANCIAL_ANALYST, BUDGET_OPTIMIZER, ANOMALY_DETECTOR

Features:
  budget-forecasting, variance-analysis, fraud-detection
```

---

## 🔄 What Changes When You Switch

### 1. **Navbar**
- **SPARCC** text: Same font, but gradient changes from blue-purple to orange
- **"for Sales"** → **"for Enterprise: Finance"** (underneath SPARCC logo)
- **SGM Circle**: Gradient changes from blue-purple to orange

### 2. **Homepage** (`/`)
- **Background**: Subtle gradient from light orange to white (instead of purple-blue)
- **Hero Title**: "Sales Governance Management" displayed in orange gradient
- **Quick Access Cards**: Hover states show orange colors

### 3. **Mode Landing Pages**
- **Design Mode** (`/design`):
  - Background: Burnt orange (#9a3412) gradient at 15-30% opacity
  - Metric cards: Burnt orange borders and text
  - Section borders: Burnt orange accents

- **Operate Mode** (`/operate`):
  - Background: Deep orange (#c2410c) gradient
  - Metric cards: Deep orange theme

- **Dispute Mode** (`/dispute`):
  - Background: Medium orange (#ea580c) gradient
  - Metric cards: Medium orange theme

- **Oversee Mode** (`/oversee`):
  - Background: Bright orange (#f97316) gradient
  - Metric cards: Bright orange theme

### 4. **Module Switcher** (SUPER_ADMIN only)
- Shows current active module: "SPARCC for Enterprise: Finance"
- Dropdown displays orange gradient preview for Finance module
- "Active" badge on selected module

### 5. **Settings Page** (`/settings/module`)
- Current Module Details: Shows Finance info
- Gradient Preview: Large orange gradient tile
- Color Stops: Displays all 4 orange shades with hex codes
- Mode Color Distribution: Shows orange colors for all 4 modes

---

## 🧪 Testing the Switch

### Method 1: Using the UI (SUPER_ADMIN only)

1. **Via Navbar**:
   - Click the Module Switcher dropdown (top right, before Mode tabs)
   - Select "SPARCC for Enterprise: Finance"
   - Page reloads with orange color scheme ✨

2. **Via Settings Page**:
   - Navigate to `/settings/module`
   - Click Module Switcher dropdown
   - Select "Finance"
   - Page reloads automatically

### Method 2: Using the API

**Switch to Finance:**
```bash
curl -X PUT http://localhost:3000/api/settings/module \
  -H "Content-Type: application/json" \
  -d '{"moduleId": "sparcc-finance"}' \
  -b "next-auth.session-token=<your-admin-token>"
```

**Switch back to SGM:**
```bash
curl -X PUT http://localhost:3000/api/settings/module \
  -H "Content-Type: application/json" \
  -d '{"moduleId": "sgm"}' \
  -b "next-auth.session-token=<your-admin-token>"
```

### Method 3: Using Test Script

```bash
npx tsx scripts/test-module-switch.ts
```

This script:
- Shows current module (SGM)
- Switches to Finance
- Displays all color changes
- Shows mode color distribution
- Switches back to SGM

---

## 🎯 Expected Results After Switch

### ✅ Immediate Changes
- [x] Navbar tagline: "for Enterprise: Finance"
- [x] Navbar gradient: Orange spectrum
- [x] Page background: Orange gradient
- [x] All metric cards: Orange borders and text
- [x] Mode landing pages: Orange-themed backgrounds
- [x] Quick access hover: Orange highlights

### ✅ No Breaking Changes
- [x] All existing routes still work
- [x] Navigation structure unchanged
- [x] Data and functionality preserved
- [x] Only visual theme changes

### ✅ Module Switcher Shows
- [x] "SPARCC for Enterprise: Finance" as active
- [x] Orange gradient preview in dropdown
- [x] Checkmark on Finance module
- [x] All 3 modules listed (SGM, Enterprise Sales, Enterprise Finance)

---

## 🔐 Security & Permissions

**Who can switch modules:**
- ✅ SUPER_ADMIN role only
- ❌ ADMIN, MANAGER, USER, VIEWER: Cannot see switcher

**API Authentication:**
- Requires valid NextAuth session
- Validates SUPER_ADMIN role server-side
- Logs all module switches with user email

**Audit Trail:**
```
[MODULE_SWITCH] User sarah.chen@company.com switched module to: sparcc-finance
```

---

## 🚀 Rollback

If you need to revert to SGM:

1. **Via UI**: Select "Sales Governance" in Module Switcher
2. **Via API**:
   ```bash
   curl -X PUT .../api/settings/module -d '{"moduleId": "sgm"}'
   ```
3. **Via Code**:
   ```typescript
   setActiveModule('sgm');
   ```

---

## 💡 Use Cases for Enterprise Finance Module

**When to use Finance module:**
- Financial operations teams
- Budget management workflows
- Forecasting and variance analysis
- Transaction monitoring
- Account reconciliation
- Enterprise finance departments

**Key Differences from SGM:**
- **Data Focus**: Budget, Forecast, Transaction vs. Plan, Policy, Document
- **AI Agents**: Financial analysis vs. Governance analysis
- **Color Psychology**: Orange (warmth, money, energy) vs. Purple-Blue (trust, professionalism)
- **Branding**: Enterprise suite vs. Specialized sales tool

---

## 📊 Visual Color Palette

### Finance Module Orange Palette

```
#f97316  ██████  Orange-500 (Oversee)   - Bright, energetic
#ea580c  ██████  Orange-600 (Dispute)   - Warm, balanced
#c2410c  ██████  Orange-700 (Operate)   - Rich, grounded
#9a3412  ██████  Orange-800 (Design)    - Deep, strategic
```

### SGM Module Blue-Purple Palette (Current)

```
#0ea5e9  ██████  Cyan-500   (Oversee)   - Fresh, clear
#3b82f6  ██████  Blue-500   (Dispute)   - Trust, stable
#6366f1  ██████  Indigo-500 (Operate)   - Professional
#8b5cf6  ██████  Violet-500 (Design)    - Creative, strategic
```

---

## 🎨 Design Philosophy

### Color Distribution Algorithm

The module system uses **linear RGB interpolation** to distribute gradient colors to exactly 4 modes:

```
Position 0.0  → OVERSEE (monitoring foundation)
Position 0.33 → DISPUTE (exception handling)
Position 0.67 → OPERATE (day-to-day operations)
Position 1.0  → DESIGN (strategic framework)
```

This ensures:
- ✅ Consistent visual hierarchy across all modules
- ✅ Automatic color harmony (no manual tuning needed)
- ✅ Scalable to unlimited modules
- ✅ Mathematical precision in color distribution

---

## 🔮 Future Modules

The system is designed to support dozens of SPARCC modules:

**SPARCC for Enterprise (ROYGBIV Spectrum):**
- ✅ Finance (Orange) - Available now
- ✅ Sales (Yellow) - Available now
- 🔜 Marketing (Green)
- 🔜 Product (Cyan)
- 🔜 Customer Success (Blue)
- 🔜 HR (Indigo)
- 🔜 IT (Deep Indigo)
- 🔜 Operations (Purple)
- 🔜 Legal (Violet)

Each module will have its own:
- Unique color gradient
- Custom data entities
- Specialized AI agents
- Domain-specific features
- Tailored branding

**All changes: Zero code required!** Just add to module registry. 🎉

## See also
- `docs/KB_OVERVIEW.md`
- `docs/KB_PAGE_INDEX.md`
- Relevant KB routes: /settings/module, /design, /operate, /dispute, /oversee
