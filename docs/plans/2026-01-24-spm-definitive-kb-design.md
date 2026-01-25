# SPM Definitive Knowledge Base — Design Document

> **Author:** Todd LeBaron / BHG Consulting
> **Date:** January 24, 2026
> **Status:** Approved for Implementation

---

## Vision

Transform the SPM 101 Knowledge Base into **the definitive industry reference** for Sales Performance Management — the Rosetta Stone of SPM that consultants cite, vendors align to, and practitioners learn from.

**Current State:** 338 keywords across 3 domains
**Target State:** 1,000+ keywords across 8 pillars with rich Framework Cards

---

## Gap Analysis

No existing SPM resource:
- Spans all audiences (Practitioners, Executives, Implementers, Vendors)
- Covers the full lifecycle (Strategy → Design → Implementation → Operations → Governance)
- Integrates regulatory/compliance (SOX, 409A, clawback, state wage laws)
- Maps to vendor capabilities
- Includes emerging AI/Analytics terminology

**Sources Researched:**
- [Spiff - 5 Pillars of SPM](https://spiff.com/blog/sales-performance-management/)
- [Xactly - What is SPM](https://www.xactlycorp.com/blog/sales-performance/what-is-sales-performance-management)
- [Alexander Group](https://www.alexandergroup.com/)
- [Korn Ferry Sales Compensation](https://www.kornferry.com/capabilities/total-rewards-program/sales-compensation)
- [OpenSymmetry 2024 SPM Vendor Guide](https://www.opensymmetry.com/wp-content/uploads/2024/09/SPM-Vendor-Guide-2024.pdf)
- [Gartner SPM Reviews](https://www.gartner.com/reviews/market/sales-performance-management)

---

## 8-Pillar Architecture

| # | Pillar | Focus | Keywords |
|---|--------|-------|----------|
| 1 | **Sales Planning** | Territory, quota, capacity, coverage models | 140 → 200+ |
| 2 | **Incentive Compensation Management** | Plan design, calculations, payments, statements | 158 → 250+ |
| 3 | **Sales Intelligence & Analytics** | Reporting, forecasting, AI/ML, predictive | 40 → 150+ |
| 4 | **Governance & Compliance** | SOX, 409A, clawback, audit, controls, approvals | NEW: 100+ |
| 5 | **Technology & Platforms** | SPM vendors, integrations, data architecture, APIs | NEW: 80+ |
| 6 | **Strategy & Design** | Pay philosophy, behavioral economics, benchmarking | NEW: 100+ |
| 7 | **Implementation & Change** | Project methodology, change management, training | NEW: 60+ |
| 8 | **Legal & Regulatory** | State wage laws, international, employment law | NEW: 80+ |

**Total Target: 1,000+ keywords**

---

## Pillar Content Details

### Pillar 1: Sales Planning (140 → 200+)
- Capacity planning models (bottoms-up, tops-down, hybrid)
- Coverage optimization (hunter/farmer, overlay, specialist)
- Headcount modeling, ramp assumptions, productivity curves
- Account segmentation (TAM, SAM, SOM, ICP)

### Pillar 2: ICM (158 → 250+)
- Plan mechanics: accelerators, decelerators, caps, floors, cliffs, gates
- Payment types: draws, guarantees, advances, true-ups
- Crediting rules: direct, overlay, split, team, manager rollup
- Calculation concepts: effective rates, blended rates, weighted attainment

### Pillar 3: Sales Intelligence & Analytics (40 → 150+)
- AI/ML: propensity scoring, churn prediction, deal scoring
- Forecasting: weighted pipeline, AI-assisted, judgmental
- Analytics: cohort analysis, rep benchmarking, plan effectiveness
- Dashboards: leaderboards, attainment curves, payout distribution

### Pillar 4: Governance & Compliance (NEW: 100+)
- SOX controls: segregation of duties, audit trails, change management
- 409A compliance: deferred compensation, substantial risk of forfeiture
- Clawback policies: SEC Rule 10D-1, triggering events, recovery methods
- Approval workflows: SGCC, CRB, exception governance

### Pillar 5: Technology & Platforms (NEW: 80+)
- Platform categories: ICM, SPM, CPQ, CRM, ERP integrations
- Vendor landscape: Xactly, Varicent, Anaplan, CaptivateIQ, Forma.ai, Performio, Spiff
- Data architecture: staging tables, calculation engines, payment files, GL interfaces
- Integration patterns: real-time vs batch, API types, middleware, ETL

### Pillar 6: Strategy & Design (NEW: 100+)
- Pay philosophy: pay-for-performance, market positioning, cost of sales
- Behavioral economics: motivation theory, goal gradient, loss aversion
- Plan design: pay mix, leverage, upside potential, risk/reward balance
- Benchmarking: market data, percentile targeting, TTC

### Pillar 7: Implementation & Change (NEW: 60+)
- Project phases: discovery, design, build, test, deploy, hypercare
- Change management: stakeholder mapping, communication plans, training
- Adoption metrics: statement views, inquiry rates, dispute volumes
- Go-live readiness: parallel runs, reconciliation, rollback planning

### Pillar 8: Legal & Regulatory (NEW: 80+)
- US regulations: FLSA, state wage laws (CA, NY, IL specifics)
- International: GDPR data handling, country-specific comp rules
- Documentation: plan documents, acknowledgments, amendments
- Dispute resolution: escalation paths, arbitration, legal holds

---

## Framework Card Structure

### Card Sections

| Section | Purpose | Length |
|---------|---------|--------|
| **Definition** | What it is (crisp) | 20-40 words |
| **Why It Matters** | Business impact | 30-50 words |
| **How It Works** | Mechanics, process | 50-100 words |
| **Who Uses It** | Roles + interactions | 30-50 words |
| **Best Practices** | Do's and don'ts | 3-5 bullets |
| **Watch Out For** | Common mistakes | 2-3 bullets |
| **Example** | Real-world scenario | 30-50 words |

### Process Card Extensions (for operational terms)

| Section | When to Include |
|---------|-----------------|
| **Process Flow** | Workflow/activity terms |
| **Inputs** | Calculated/derived terms |
| **Outputs** | Terms that produce artifacts |
| **Upstream/Downstream** | Connected processes |
| **Systems Involved** | Tech touchpoints |
| **Timing/Frequency** | Cadence-sensitive terms |

### Card Types

| Type | Sections | Count |
|------|----------|-------|
| **Concept Card** | Definition, Why, Best Practices | ~400 |
| **Mechanic Card** | + How It Works, Example, Watch Out | ~300 |
| **Process Card** | + Flow, Inputs/Outputs, Systems, Timing | ~200 |
| **Role Card** | + Responsibilities, Skills, Interactions | ~50 |
| **Regulation Card** | + Legal Basis, Requirements, Penalties | ~70 |

---

## Enhanced Data Schema

```json
{
  "id": "string",
  "keyword": "string",
  "aliases": ["string"],
  "definition": "string",
  "extendedDefinition": "string",
  "whyItMatters": "string",
  "howItWorks": "string",
  "pillar": "string",
  "category": "string",
  "component": "string",
  "cardType": "concept | mechanic | process | role | regulation",
  "userTypes": ["string"],
  "audienceLevel": ["Practitioner", "Executive", "Implementer"],
  "whoUsesIt": [
    { "role": "string", "howTheyUseIt": "string" }
  ],
  "bestPractices": ["string"],
  "watchOutFor": ["string"],
  "example": "string",
  "relatedTerms": ["string"],
  "oppositeTerms": ["string"],
  "processFlow": {
    "upstream": ["string"],
    "downstream": ["string"],
    "diagram": "string"
  },
  "inputs": ["string"],
  "outputs": ["string"],
  "systemsInvolved": ["string"],
  "timing": "string",
  "vendorTerminology": {
    "Xactly": "string",
    "Varicent": "string",
    "CaptivateIQ": "string"
  },
  "regulatoryNotes": "string",
  "sourceAuthority": ["string"],
  "tags": ["string"]
}
```

---

## Execution Plan

### Phase 1: Foundation (Week 1)
- [ ] Finalize 8-pillar taxonomy and category structure
- [ ] Define card templates (JSON schema for each card type)
- [ ] Audit existing 338 keywords — classify by card type
- [ ] Set up content structure in repo

### Phase 2: Research & Expansion (Weeks 2-3)
- [ ] Web research: Vendor docs, consulting frameworks, regulations
- [ ] Extract keywords from industry sources
- [ ] Map competitor KB gaps
- [ ] Build master keyword list → 1,000+

### Phase 3: Content Enrichment (Weeks 3-5)
- [ ] Upgrade existing 338 definitions to framework cards
- [ ] Prioritize ~200 Core terms for full-depth treatment
- [ ] Write new keywords for Pillars 4-8
- [ ] Add process flows for ~200 operational terms

### Phase 4: Quality & Review (Week 6)
- [ ] Expert review pass (thought leadership lens)
- [ ] Cross-reference validation
- [ ] Consistency check

### Phase 5: RAG Integration (Week 7)
- [ ] Export to RAG-optimized format for aicr
- [ ] Chunk strategy for embeddings
- [ ] Test retrieval quality
- [ ] Deploy to SPM LLM

---

## Deliverables

| Artifact | Format | Location |
|----------|--------|----------|
| SPM Knowledge Base | JSON | sgm-sparcc-demo + aicr |
| Framework Card UI | React Component | sgm-sparcc-demo |
| RAG Embeddings | Vector DB | aicr |
| PDF Reference Guide | Export | Marketing/Clients |

---

## Future: Vendor Flavors

Post-launch enhancement: Add vendor-specific "flavors" that map terminology and best practices to specific SPM platforms (Xactly, Varicent, CaptivateIQ, etc.)

---

*This document represents the definitive plan for establishing BHG Consulting as the SPM thought leader through comprehensive knowledge architecture.*
