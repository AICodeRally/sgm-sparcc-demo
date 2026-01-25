import type { GovernanceFramework } from '@/lib/contracts/governance-framework.contract';
import governanceChecklistData from './governance-checklist.json';
import spm101FrameworkData from './spm-101-framework.json';

/**
 * Synthetic Governance Framework Data
 * SPM methodology and governance guardrails
 */

const DEFAULT_TENANT_ID = 'demo-tenant-001';
const CREATED_BY = 'BHG Consulting';
const NOW = new Date('2026-01-07T12:00:00Z');

// =============================================================================
// SPM-FW-001: SPARCC Core Methodology
// =============================================================================

export const framework1: GovernanceFramework = {
  id: 'fw-001-id',
  tenantId: DEFAULT_TENANT_ID,
  code: 'SPM-FW-001',
  title: 'SPARCC Core Methodology',
  category: 'METHODOLOGY',
  content: `# SPARCC Core Methodology

## Overview

SPARCC (Sales Performance, Alignment, Recognition, Compensation & Communication) is the foundational framework for designing and implementing compensation plans.

## Key Principles

### 1. Strategic Alignment
- Compensation plans must align with business objectives
- Link pay to performance metrics that drive revenue growth
- Ensure quota allocation reflects territory potential

### 2. Performance Measurement
- Define clear, measurable performance indicators
- Establish baseline performance levels
- Set realistic but challenging targets

### 3. Recognition & Rewards
- Timely recognition of achievement
- Competitive compensation packages
- Non-monetary recognition programs

### 4. Compensation Structure
- Base salary + variable compensation
- Commission rates tied to quota attainment
- Accelerators for exceeding targets
- Caps and thresholds clearly defined

### 5. Communication
- Transparent plan documentation
- Regular updates on performance
- Clear dispute resolution process

## Compliance Requirements

All compensation plans must:
- Include clear eligibility criteria
- Define payment schedules and timing
- Specify proration rules for mid-period hires
- Document exception handling procedures
- Establish governance oversight (SGCC/CRB approval)

## Governance Framework

- **Approval Authority**: SGCC for standard plans, CRB for exceptions
- **Review Cycle**: Annual review required
- **Amendment Process**: Requires executive approval for mid-year changes
- **Audit Requirements**: Quarterly compliance audits

---

**Version**: 1.0.0
**Last Updated**: January 2026
**Owner**: BHG Consulting
`,
  contentType: 'markdown',
  structuredContent: null,
  version: '1.0.0',
  status: 'ACTIVE',
  isGlobal: true,
  isMandatory: true,
  applicableTo: ['COMPENSATION_PLAN', 'GOVERNANCE_PLAN'],
  createdBy: CREATED_BY,
  createdAt: NOW,
  updatedAt: NOW,
};

// =============================================================================
// SPM-FW-002: Compensation Governance Best Practices
// =============================================================================

export const framework2: GovernanceFramework = {
  id: 'fw-002-id',
  tenantId: DEFAULT_TENANT_ID,
  code: 'SPM-FW-002',
  title: 'Compensation Governance Best Practices',
  category: 'BEST_PRACTICES',
  content: `# Compensation Governance Best Practices

## Design Principles

### Simplicity
- Plans should be easy to understand
- Avoid overly complex calculation formulas
- Limit number of plan components

### Fairness
- Equitable treatment across similar roles
- Transparent criteria for exceptions
- Consistent application of rules

### Competitiveness
- Benchmark against industry standards
- Regular market analysis (annually minimum)
- Competitive pay ranges by role/level

## Plan Components

### Required Elements
1. **Executive Summary** - High-level overview
2. **Eligibility Criteria** - Who qualifies
3. **Performance Metrics** - What gets measured
4. **Payout Calculation** - How compensation is determined
5. **Payment Schedule** - When payouts occur
6. **Dispute Resolution** - How conflicts are resolved

### Recommended Elements
- Plan objectives and goals
- Examples and scenarios
- Frequently asked questions
- Glossary of terms

## Governance Checkpoints

### Pre-Launch
- [ ] Legal review completed
- [ ] Finance approval obtained
- [ ] SGCC/CRB approval secured
- [ ] Communication plan in place
- [ ] Training materials prepared

### Post-Launch
- [ ] Monthly performance tracking
- [ ] Quarterly compliance audits
- [ ] Annual effectiveness review
- [ ] Continuous improvement process

## Risk Mitigation

### Common Pitfalls to Avoid
- Unclear eligibility rules
- Ambiguous performance definitions
- Missing proration rules
- Lack of governance oversight
- Inadequate communication

### Control Measures
- Mandatory peer review before approval
- Version control for all plan documents
- Audit trail for all amendments
- Exception tracking and reporting

---

**Version**: 1.0.0
**Last Updated**: January 2026
**Owner**: BHG Consulting
`,
  contentType: 'markdown',
  structuredContent: null,
  version: '1.0.0',
  status: 'ACTIVE',
  isGlobal: true,
  isMandatory: false,
  applicableTo: ['COMPENSATION_PLAN'],
  createdBy: CREATED_BY,
  createdAt: NOW,
  updatedAt: NOW,
};

// =============================================================================
// SPM-FW-003: Policy Writing Standards
// =============================================================================

export const framework3: GovernanceFramework = {
  id: 'fw-003-id',
  tenantId: DEFAULT_TENANT_ID,
  code: 'SPM-FW-003',
  title: 'Policy Writing Standards',
  category: 'STANDARDS',
  content: `# Policy Writing Standards

## Document Structure

All policy documents must follow this structure:

### 1. Header
- Policy Code (e.g., POL-COMP-001)
- Title
- Version Number
- Effective Date
- Owner/Sponsor
- Approval Authority

### 2. Purpose Statement
- Why this policy exists
- What problem it solves
- Scope of applicability

### 3. Policy Statement
- Clear, declarative statements
- Use "must" for requirements, "should" for recommendations
- Active voice preferred

### 4. Definitions
- Glossary of key terms
- Acronyms spelled out
- Context-specific meanings

### 5. Procedures
- Step-by-step instructions
- Process flows where applicable
- Decision trees for complex scenarios

### 6. Roles & Responsibilities
- Who does what
- Approval authorities
- Escalation paths

### 7. Compliance & Enforcement
- Monitoring mechanisms
- Audit requirements
- Consequences of non-compliance

### 8. Exceptions
- Exception request process
- Approval authorities for exceptions
- Documentation requirements

### 9. References
- Related policies
- Legal/regulatory citations
- Supporting documentation

### 10. Revision History
- Version tracking
- Change log
- Effective dates

## Writing Style Guidelines

### Clarity
- Short sentences (15-20 words max)
- Simple language (8th-grade reading level)
- Avoid jargon and acronyms where possible

### Consistency
- Use standard terminology throughout
- Maintain consistent formatting
- Follow corporate style guide

### Accessibility
- WCAG 2.1 compliance for digital documents
- Alternative text for images/charts
- Proper heading hierarchy

## Review & Approval Process

1. **Draft Review** - Subject matter expert review
2. **Legal Review** - Compliance and risk assessment
3. **Stakeholder Review** - Affected parties provide input
4. **Executive Approval** - Final sign-off
5. **Publication** - Make available to intended audience

---

**Version**: 1.0.0
**Last Updated**: January 2026
**Owner**: BHG Consulting
`,
  contentType: 'markdown',
  structuredContent: null,
  version: '1.0.0',
  status: 'ACTIVE',
  isGlobal: true,
  isMandatory: false,
  applicableTo: ['POLICY_CREATION_PLAN'],
  createdBy: CREATED_BY,
  createdAt: NOW,
  updatedAt: NOW,
};

// =============================================================================
// SPM-FW-004: Governance Implementation Checklist
// =============================================================================

export const framework4: GovernanceFramework = {
  id: 'fw-004-id',
  tenantId: DEFAULT_TENANT_ID,
  code: 'SPM-FW-004',
  title: 'Governance Implementation Checklist',
  category: 'METHODOLOGY',
  content: 'Interactive governance maturity checklist — 12 phases covering the full path from no governance to a Center of Excellence.',
  contentType: 'checklist',
  structuredContent: governanceChecklistData,
  version: '1.0.0',
  status: 'ACTIVE',
  isGlobal: true,
  isMandatory: false,
  applicableTo: ['GOVERNANCE_PLAN'],
  createdBy: CREATED_BY,
  createdAt: new Date('2026-01-01T00:00:00Z'),
  updatedAt: new Date('2026-01-24T00:00:00Z'),
};

// =============================================================================
// SPM-FW-005: SPM 101 Knowledge Base
// =============================================================================

export const framework5: GovernanceFramework = {
  id: 'fw-005-id',
  tenantId: DEFAULT_TENANT_ID,
  code: 'SPM-FW-005',
  title: 'SPM 101 Knowledge Base',
  category: 'BEST_PRACTICES',
  content: 'Comprehensive SPM glossary and knowledge base — 338 keywords across Sales Planning, Incentive Compensation Management, and Sales Intelligence.',
  contentType: 'glossary',
  structuredContent: spm101FrameworkData,
  version: '1.0.0',
  status: 'ACTIVE',
  isGlobal: true,
  isMandatory: false,
  applicableTo: ['COMPENSATION_PLAN', 'GOVERNANCE_PLAN'],
  createdBy: CREATED_BY,
  createdAt: new Date('2026-01-01T00:00:00Z'),
  updatedAt: new Date('2026-01-24T00:00:00Z'),
};

// =============================================================================
// Aggregate Exports
// =============================================================================

export const syntheticGovernanceFrameworks: GovernanceFramework[] = [
  framework1,
  framework2,
  framework3,
  framework4,
  framework5,
];
