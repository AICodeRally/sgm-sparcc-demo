# GovLens Unified Patch System

**Date**: 2026-01-08
**Status**: ✅ COMPLETE

---

## Overview

GovLens now has **TWO complementary patch generation systems** working together:

1. **Python Prototype** - Generates patches during analysis (1,062 patches across 20 plans)
2. **TypeScript Templates** - 55 YAML templates for interactive patch application

```
┌─────────────────────────────────────────────────────────────┐
│                     UNIFIED PATCH SYSTEM                     │
└─────────────────────────────────────────────────────────────┘
                              │
            ┌─────────────────┴─────────────────┐
            │                                   │
┌───────────▼──────────┐           ┌───────────▼──────────┐
│  Python Patches      │           │  TypeScript Templates│
│  (Batch/Automated)   │           │  (Interactive/UI)    │
│                      │           │                      │
│ • Generate during    │           │ • 16 YAML templates  │
│   analysis           │           │ • 55 requirements    │
│ • 1,062 patches      │           │ • Full + Partial     │
│ • Severity-based     │           │ • JSON blocks        │
│ • State-specific     │           │ • Placeholders       │
│ • TXT + MD output    │           │ • State notes        │
│                      │           │                      │
│ USE CASE:            │           │ USE CASE:            │
│ Batch processing     │           │ Interactive editing  │
│ Offline analysis     │           │ Plan editor UI       │
│ Executive reports    │           │ One-click apply      │
└──────────────────────┘           └──────────────────────┘
```

---

## Python Patch System

### What It Does

**Automatically generates remediation patches during document analysis**

### Output Files (Per Document)

1. **`*_REMEDIATION_PATCHES.txt`** (2,500+ lines)
   - Full remediation language for all gaps
   - Ready-to-copy policy text
   - Insertion points marked
   - Placeholders for customization

2. **`*_REMEDIATION_CHECKLIST.md`** (60+ lines)
   - Progress tracker
   - Severity-based prioritization
   - Implementation timelines

### Example Patch

```
================================================================================
PATCH #1: Section 409A Short-Term Deferral Safe Harbor
================================================================================

Severity: CRITICAL
Policy: SCP-007
Requirement: R-007-01
Insertion Point: Section: Plan Administration
State Notes: Applies to all states (federal tax law)

--------------------------------------------------------------------------------
REMEDIATION LANGUAGE
--------------------------------------------------------------------------------

**SECTION 409A COMPLIANCE**

This compensation plan is designed to comply with, or be exempt from,
Section 409A of the Internal Revenue Code ("Section 409A"). To the extent
applicable, this Plan shall be interpreted and administered in accordance
with Section 409A.

All commission payments under this Plan will be paid no later than March 15th
of the calendar year following the calendar year in which the commission is
earned and no longer subject to a substantial risk of forfeiture, qualifying
as "short-term deferrals" under Treasury Regulation §1.409A-1(b)(4).

If any provision of this Plan would cause a payment to be subject to Section
409A penalties, that provision shall be reformed to maintain short-term
deferral status.

--------------------------------------------------------------------------------
CUSTOMIZATION
--------------------------------------------------------------------------------

Placeholders: None (standard language)
Legal Review: Required (federal tax compliance)
Implementation Effort: 15-30 minutes

================================================================================
```

### Usage

**CLI**:
```bash
python govlens.py analyze "plan.pdf" --generate-patches
```

**API**:
```bash
# Analyze document (patches generated automatically)
curl -X POST "http://localhost:8000/api/analyze" \
  -F "file=@plan.pdf"

# Download patches
curl "http://localhost:8000/api/reports/plan_20260108/patches" > patches.txt

# Download checklist
curl "http://localhost:8000/api/reports/plan_20260108/checklist" > checklist.md
```

**TypeScript**:
```typescript
import { analyzeDocument, getPatches, getChecklist } from '@/lib/services/govlens/api-client';

// Analyze
const result = await analyzeDocument(file, 'CA');
const docId = result.document_name.replace('.pdf', '');

// Get patches
const patches = await getPatches(docId);
console.log(patches); // Full TXT content

// Get checklist
const checklist = await getChecklist(docId);
console.log(checklist); // Markdown checklist
```

---

## TypeScript Template System

### What It Does

**Provides interactive patch templates for Next.js UI**

### Templates (16 YAML files)

Location: `<CLIENT_DELIVERY_PACKAGE>/patch_templates/`

### Local Dev Paths

| Variable | Purpose | Default |
| --- | --- | --- |
| `PATCH_TEMPLATES_DIR` | Patch template directory | `<REPO_ROOT>/patch_templates` |

| Code | Policy | Requirements | Variants |
|------|--------|--------------|----------|
| SCP-001 | Clawback and Recovery | 3 | Full + Partial |
| SCP-002 | Quota and Territory | 3 | Full + Partial |
| SCP-003 | Payment Timing | 3 | Full + Partial |
| ... | ... | ... | ... |
| SCP-016 | Ethics and Compliance | 4 | Full + Partial |

**Total**: 55 requirements

### Example Template

```yaml
policy_code: SCP-007
policy_name: Section 409A Compliance Policy

patches:
  - requirement_id: R-007-01
    requirement_name: Short-Term Deferral Safe Harbor
    severity: CRITICAL
    insertion_point: "Section: Plan Administration"

    templates:
      full_coverage:
        title: "Section 409A Compliance"
        language: |
          **SECTION 409A COMPLIANCE**

          This compensation plan is designed to comply with...

        placeholders:
          - name: "[MARCH 15TH/2.5 MONTHS]"
            description: "Payment deadline"
            recommended: "March 15th"
            required: true

      partial_coverage:
        title: "409A Savings Clause"
        language: |
          This Plan is intended to comply with Section 409A...

validation_rules:
  - rule: "Must specify payment deadline"
    check: "contains(March 15th)"

state_specific_notes:
  ALL: |
    Section 409A is federal tax law and applies to all states.
    Consult tax counsel before implementing.
```

### Usage

```typescript
import { applyPatch } from '@/lib/services/patch-templates';

// Apply patch with customization
const patch = await applyPatch({
  policyCode: 'SCP-007',
  requirementId: 'R-007-01',
  coverage: 'full',
  targetSectionKey: 'section-admin',
  insertionPosition: 'END',
  placeholderValues: {
    '[MARCH 15TH/2.5 MONTHS]': 'March 15th'
  },
  jurisdiction: 'CA'
});

// Result is JSON blocks ready for plan editor
console.log(patch.contentJson.blocks);
// [
//   { type: 'heading', content: 'Section 409A Compliance' },
//   { type: 'paragraph', content: '...' },
//   ...
// ]
```

---

## How They Work Together

### Workflow 1: Batch Analysis → Python Patches

**Use Case**: Consultant analyzing 20 plans offline

```
1. Run batch analysis:
   python govlens.py batch "Comp Plans/"

2. Python generates for each plan:
   - plan_gap_analysis.json
   - plan_gap_analysis.md
   - plan_REMEDIATION_PATCHES.txt  ← Ready to copy/paste
   - plan_REMEDIATION_CHECKLIST.md ← Track progress

3. Consultant reviews patches:
   - Open patches.txt
   - Copy/paste language into Word/PDF
   - Mark checklist as complete

4. Client receives:
   - Updated plan with all gaps remediated
   - Checklist showing what was fixed
```

**Time**: 2-3 minutes for 20 plans + 2-4 hours manual application

---

### Workflow 2: Interactive UI → TypeScript Templates

**Use Case**: User editing plan in Next.js web app

```
1. User uploads plan:
   → Next.js calls Python API
   → Receives gap analysis

2. UI shows gaps:
   Gap: SCP-007 Section 409A Compliance - CRITICAL
   [Apply Patch] button

3. User clicks "Apply Patch":
   → TypeScript loads SCP-007.yaml template
   → Replaces placeholders with user values
   → Converts to JSON blocks
   → Merges into plan section

4. User sees updated plan:
   → Section now has 409A compliance language
   → JSON blocks integrated seamlessly
   → Re-run analysis to verify

5. Coverage improves:
   → Before: 21.3% (53 gaps)
   → After: 78.4% (12 gaps)
```

**Time**: Instant (< 1 second per patch)

---

### Workflow 3: Hybrid Approach (Best of Both)

**Use Case**: Upload PDF, get Python patches, apply via UI

```
1. Upload plan via Next.js UI:
   → Calls Python API: POST /api/analyze

2. Python returns:
   {
     "gaps": [...],
     "output_files": {
       "patches": "plan_REMEDIATION_PATCHES.txt"
     }
   }

3. UI downloads Python patches:
   → GET /api/reports/plan_20260108/patches
   → Displays in "Suggested Remediation" panel

4. User reviews Python patches:
   → Sees all 53 patches with full language
   → Chooses which to apply

5. For each patch, user clicks "Apply":
   → TypeScript loads corresponding YAML template
   → Pre-fills placeholders from Python patch
   → Converts to JSON blocks
   → Applies to plan section

6. Result:
   → Best of both: Python's comprehensive analysis
   → Plus TypeScript's interactive application
```

**Time**: 2-3 minutes analysis + 10-15 minutes review + instant application

---

## Content Comparison

### Same Policy, Different Systems

**Python Patch** (`plan_REMEDIATION_PATCHES.txt`):
```
================================================================================
PATCH #1: Section 409A Short-Term Deferral Safe Harbor
================================================================================

Severity: CRITICAL
Policy: SCP-007
Requirement: R-007-01

**SECTION 409A COMPLIANCE**

This compensation plan is designed to comply with, or be exempt from,
Section 409A of the Internal Revenue Code...

All commission payments will be paid no later than March 15th of the
calendar year following the calendar year in which the commission is
earned and no longer subject to a substantial risk of forfeiture.

[Full text continues for 150+ lines...]
```

**TypeScript Template** (`SCP-007_section_409A.yaml`):
```yaml
patches:
  - requirement_id: R-007-01
    templates:
      full_coverage:
        language: |
          **SECTION 409A COMPLIANCE**

          This compensation plan is designed to comply with, or be exempt from,
          Section 409A of the Internal Revenue Code...

          All commission payments will be paid no later than [MARCH 15TH/2.5 MONTHS]
          of the calendar year following the calendar year in which the commission
          is earned and no longer subject to a substantial risk of forfeiture.
```

**Key Differences**:
- Python: Fixed text, ready to copy
- TypeScript: Template with placeholders for customization

**Content**: ~95% identical (same source material)

---

## API Endpoints for Patches

### New Endpoints Added

```
GET /api/reports/{document_id}/patches
  Returns: Full patch text file (2,500+ lines)
  Format: text/plain

GET /api/reports/{document_id}/checklist
  Returns: Progress tracking checklist
  Format: text/markdown
```

### Example Usage

```bash
# Get patches for FSC plan
curl "http://localhost:8000/api/reports/Dental_FSC_20260108/patches" \
  > fsc_patches.txt

# Get checklist
curl "http://localhost:8000/api/reports/Dental_FSC_20260108/checklist" \
  > fsc_checklist.md
```

**TypeScript**:
```typescript
import { getPatches, getChecklist } from '@/lib/services/govlens/api-client';

// Get all patches
const patches = await getPatches('Dental_FSC_20260108');

// Parse patches (split by separator)
const patchList = patches.split('='.repeat(80)).filter(p => p.trim());

// Display in UI
patchList.forEach((patch, i) => {
  console.log(`Patch ${i + 1}:`);
  console.log(patch);
});

// Get checklist
const checklist = await getChecklist('Dental_FSC_20260108');
console.log(checklist); // Markdown format
```

---

## Statistics: Python Patch Generation

### Batch Run: 20 Compensation Plans

**Total Patches Generated**: 1,062

**By Severity**:
| Severity | Count | % of Total |
|----------|-------|------------|
| CRITICAL | 120 | 11.3% |
| HIGH | 280 | 26.4% |
| MEDIUM | 440 | 41.4% |
| LOW | 222 | 20.9% |

**By Plan**:
| Plan | Patches | Severity Breakdown |
|------|---------|-------------------|
| HSIC HSIP Overview | 55 | 6C, 14H, 22M, 13L |
| the Company Incentive | 53 | 5C, 15H, 25M, 8L |
| Dental FSC | 50 | 6C, 14H, 22M, 8L |
| ... | ... | ... |

**Output Files**: 81 files, 4.2 MB total

---

## Recommendations

### When to Use Python Patches

✅ **Use Python patches when**:
- Analyzing multiple plans in batch
- Working offline (consultant laptop)
- Generating executive reports
- Need comprehensive remediation language
- Client prefers Word/PDF format

### When to Use TypeScript Templates

✅ **Use TypeScript templates when**:
- Interactive plan editing in web UI
- User wants to customize placeholders
- Real-time gap remediation
- Need JSON blocks for plan editor
- Want visual preview before applying

### Best Practice: Use Both

**Optimal Workflow**:
1. Upload plan → Python API analyzes
2. Download Python patches → Review comprehensive language
3. Apply via TypeScript templates → Interactive UI application
4. Customize placeholders → Per-client requirements
5. Merge JSON blocks → Seamless integration
6. Re-analyze → Verify improvements

**Result**: Fast automated analysis + interactive user control

---

## Future Enhancements

### Sync Systems

**Idea**: Use TypeScript templates as source for Python patches

```python
# In Python patch generator
def load_patch_templates():
    """Load YAML templates for consistent content"""
    base_path = "/path/to/patch_templates"

    templates = {}
    for yaml_file in glob.glob(f"{base_path}/SCP-*.yaml"):
        with open(yaml_file) as f:
            templates[...] = yaml.safe_load(f)

    return templates
```

**Benefit**: Single source of truth for patch content

### Patch Preview in UI

**Idea**: Show Python-generated patches in Next.js UI

```typescript
// Component: PatchPreview.tsx
const patches = await getPatches(documentId);
const patchList = parsePatchText(patches);

return (
  <div>
    {patchList.map((patch, i) => (
      <PatchCard
        key={i}
        patch={patch}
        onApply={() => applyPatchToSection(patch)}
      />
    ))}
  </div>
);
```

**Benefit**: User sees Python patches, applies via TypeScript

---

## Summary

🎉 **GovLens now has a complete unified patch system**

**Python System**:
- ✅ 1,062 patches generated across 20 real plans
- ✅ Automatic generation during analysis
- ✅ TXT + MD output formats
- ✅ Severity-based prioritization
- ✅ State-specific legal notes
- ✅ Progress tracking checklists

**TypeScript System**:
- ✅ 16 YAML templates (55 requirements)
- ✅ Full and partial coverage variants
- ✅ JSON block generation
- ✅ Placeholder replacement
- ✅ Interactive UI integration

**Together**:
- ✅ Comprehensive automated analysis
- ✅ Interactive user-controlled application
- ✅ Batch processing + single-plan editing
- ✅ Offline CLI + web UI
- ✅ Same content, different delivery

**Next**: Build UI to visualize and apply patches

## See also
- `docs/KB_OVERVIEW.md`
- `docs/KB_PAGE_INDEX.md`
- Relevant KB routes: /governance/upload, /governance-framework, /governance-matrix, /documents/upload, /plans/remediation/[planCode]
