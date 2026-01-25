# SGM Demo Walkthrough

> **For Presenters** | Last Updated: January 2026
> Demo URL: http://localhost:3030 or http://sgm.local

---

## Quick Start (5 minutes)

### Setup
1. Start dev server: `npm run dev`
2. Open http://localhost:3030
3. Sign in with demo account (any email works in synthetic mode)

### Key Demo Points
- **66+ pages** fully functional
- **17 SCP policies** (36,000+ words of content)
- **926-card Knowledge Base** covering 8+ SPM pillars
- **4 AI orbs** (Ask, Ops, Pulse, Task)
- **7 demo cases** with full workflows
- **7 approval items** across SGCC and CRB

---

## Demo Flow (15-20 minutes)

### 1. Dashboard Overview (2 min)
**Path:** `/` (Home)

**What to show:**
- Four operational mode cards (Design, Operate, Dispute, Oversee)
- Five AI orbs in the dock (Ask, Ops, Pulse, Task, KB)
- Quick stats across all modes

**Talking points:**
- "SGM provides a unified view across all sales governance activities"
- "Each mode focuses on a specific aspect of compensation governance"
- "AI assistants help surface insights and automate tasks"

---

### 2. Design Mode - Policy Library (3 min)
**Path:** `/design` → `/policies`

**What to show:**
- 26 policies in the library (17 SCP + 9 custom)
- Click into SCP-001 (Clawback and Recovery)
- Show rich policy content with sections

**Talking points:**
- "17 Sales Compensation Policies cover all governance scenarios"
- "Each policy has comprehensive content - over 36,000 words total"
- "Policies link to related documents, templates, and cases"

---

### 2b. Knowledge Base (2 min)
**Path:** `/knowledge-base`

**What to show:**
- 926 Framework Cards across 8+ pillars
- Search for "clawback" — shows relevant cards
- Filter by pillar (ICM, Governance, etc.)
- Grid vs list view toggle

**Talking points:**
- "Comprehensive reference covering all SPM concepts"
- "Cards link related terms for easy navigation"
- "Search and filter to find exactly what you need"
- "Used by AI for contextual answers"

---

### 3. Operate Mode - Documents & Approvals (3 min)
**Path:** `/operate` → `/documents` or `/approvals`

**What to show:**
- 70 documents with upload workflow
- 7 approval items with multi-step tracking
- Click into an approval to show workflow steps

**Talking points:**
- "Document management with version control and metadata"
- "Multi-step approval workflows with SLA tracking"
- "Integration with SGCC and CRB committees"

---

### 4. Dispute Mode - Cases (4 min)
**Path:** `/dispute` → `/cases`

**What to show:**
- 7 demo cases across different types
- Click CASE-2025-1201 (Territory Change) - shows active case
- Show timeline with actions and actors
- Show SLA tracking

**Case Types to highlight:**
| Case | Type | Status | Story |
|------|------|--------|-------|
| CASE-2025-1201 | Territory Change | Under Review | Lisa Johnson's quota relief request |
| CASE-2025-1189 | Dispute | Pending Info | Multi-year deal credit dispute |
| CASE-2025-1245 | Exception | Resolved | SPIF retroactive eligibility (approved) |

**Talking points:**
- "Complete case lifecycle from submission to resolution"
- "Timeline tracking shows every action and decision"
- "SLA monitoring ensures timely resolution"

---

### 5. Oversee Mode - Committees & Compliance (3 min)
**Path:** `/oversee` → `/committees`

**What to show:**
- SGCC and CRB committee structures
- Committee member roles and responsibilities
- Governance Matrix (20 policies mapped)

**Talking points:**
- "Two committees: SGCC for policies, CRB for individual decisions"
- "Clear ownership and accountability for governance"
- "Governance matrix shows coverage across all policies"

---

### 6. AI Capabilities (3 min)
**Path:** Dashboard → Click Ask orb

**What to show:**
- Ask SGM a governance question:
  - "What is the clawback policy for terminated reps?"
  - "How do windfall deals get approved?"
  - "What's the SLA for exception requests?"
- Show contextual response

**Other orbs (if AICR connected):**
- **Ops**: Pattern detection and anomaly alerts
- **Pulse**: Daily coaching recommendations
- **Task**: Work queue management

**Talking points:**
- "Natural language access to governance policies"
- "AI understands context and provides specific guidance"
- "Proactive insights surface issues before they escalate"

---

## Detailed Feature Demos

### Document Upload Flow
**Path:** `/governance/upload`

1. Upload sample compensation document (PDF/DOC)
2. System parses document sections
3. Gap analysis runs against policy library
4. Recommendations generated
5. Patches suggested for compliance

### Approval Workflow
**Path:** `/approvals` → Click any pending item

1. Show multi-step approval chain
2. Demonstrate status transitions
3. Show SLA tracking and deadline alerts
4. Explain SGCC vs CRB routing

### Governance Matrix
**Path:** `/governance-matrix`

1. 20 policies mapped to governance areas
2. Coverage indicators (Full/Partial/Gap)
3. Click into policy to see requirements
4. Show compliance percentage

---

## Demo Data Summary

| Entity | Count | Notes |
|--------|-------|-------|
| **KB Cards** | 926 | 8+ pillars, searchable |
| Policies | 26 | 17 SCP + 9 custom |
| Documents | 70 | Various types and statuses |
| Cases | 7 | Active, resolved, closed examples |
| Approvals | 7 | SGCC and CRB workflows |
| Committees | 2 | SGCC, CRB with members |
| Templates | 56 | Plan and policy templates |
| Frameworks | 6 | Governance frameworks |

---

## Common Questions

### "Is this real data?"
No - this is synthetic demo data that represents realistic scenarios. In production, this would connect to your actual systems.

### "How does the AI work?"
The Ask orb uses Claude via the AICR platform. It has access to all 17 SCP policies and the 926-card Knowledge Base. RAG (Retrieval Augmented Generation) pulls relevant context from the KB to provide accurate, contextual answers.

### "What integrations are supported?"
SGM is designed to integrate with:
- Salesforce/CRM for deal data
- Workday/HRIS for employee data
- SAP/ERP for financial data
- SSO providers for authentication

### "How long does implementation take?"
Typical implementation is 8-12 weeks including:
- Data migration
- Policy customization
- Integration setup
- Training

---

## Troubleshooting

### Page not loading
- Check dev server is running: `npm run dev`
- Verify port 3030 is available
- Check browser console for errors

### AI orb not responding
- Check AICR connection status at `/__ai/health`
- Ops/Pulse/Task require AICR deployment
- Ask orb works with local fallback

### Data looks stale
- Synthetic data uses relative dates
- Refresh page to regenerate timestamps
- Check data type toggle on dashboard

---

## Quick Reference

| Mode | Primary Actions | Key Pages |
|------|-----------------|-----------|
| **Design** | Create policies, templates | `/policies`, `/templates` |
| **Operate** | Manage docs, approvals | `/documents`, `/approvals` |
| **Dispute** | Handle cases, exceptions | `/cases`, `/cases/sla` |
| **Oversee** | Monitor compliance | `/committees`, `/governance-matrix` |
