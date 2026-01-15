/**
 * SPM Governance Policy Library v2
 *
 * Complete 21-policy library from Governance Framework 2026.
 * Includes Gold Standard Language for each policy area.
 */

// ============================================================================
// POLICY STRUCTURE
// ============================================================================

export interface PolicyV2 {
  code: string;
  name: string;
  category: string;
  section: string;
  order: number;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  summary: string;
  goldStandardLanguage: string;
  requiredElements: string[];
  detectionPatterns: string[];
  riskNotes?: string;
  relatedPolicies?: string[];
}

// ============================================================================
// SECTION A - PLAN FUNDAMENTALS (4 policies)
// ============================================================================

export const SECTION_A_POLICIES: PolicyV2[] = [
  {
    code: 'A-001',
    name: 'Standard Terms and Definitions',
    category: 'Plan Foundation',
    section: 'A - Plan Fundamentals',
    order: 1,
    severity: 'MEDIUM',
    summary: 'Standard terminology dictionary ensuring consistent language across all compensation plans. Prevents disputes arising from ambiguous language.',
    goldStandardLanguage: `### STANDARD TERMS AND DEFINITIONS

#### Core Compensation Terms
| Term | Definition |
|------|------------|
| **Base Salary** | Fixed annual compensation paid in regular installments, not contingent on performance |
| **Variable Compensation** | Pay contingent on achieving specified performance metrics |
| **On-Target Earnings (OTE)** | Total expected annual compensation at 100% quota attainment (Base + Target Variable) |
| **Target Incentive** | Expected variable compensation at 100% quota attainment |
| **Commission** | Variable pay calculated as percentage of revenue or gross profit |
| **Bonus** | Variable pay tied to achievement of specific objectives |

#### Performance Terms
| Term | Definition |
|------|------------|
| **Quota** | Assigned sales target for a defined period |
| **Attainment** | Actual performance divided by quota, expressed as percentage |
| **Threshold** | Minimum attainment level before variable pay begins (e.g., 50%) |
| **Accelerator** | Increased commission rate applied above target attainment |
| **Cap** | Maximum variable compensation payable regardless of performance |

#### Transaction Terms
| Term | Definition |
|------|------------|
| **Booked** | Order entered in system of record |
| **Closed** | Transaction completed per system definition |
| **Earned** | Commission calculation triggered; amount determinable |
| **Payable** | Commission approved for payment; all conditions satisfied |

#### Administrative Terms
| Term | Definition |
|------|------------|
| **CRB** | Compensation Review Board - governance body for plan decisions |
| **Exception** | Deviation from standard policy requiring approval |
| **Dispute** | Formal challenge to compensation calculation or payment |
| **Clawback** | Recovery of previously paid compensation |`,
    requiredElements: [
      'Compensation terms defined (base, variable, OTE)',
      'Performance terms defined (quota, attainment, threshold)',
      'Transaction terms defined (booked, closed, earned, payable)',
      'Timing terms defined (plan year, performance period)'
    ],
    detectionPatterns: ['definitions', 'glossary', 'terms.*defined', 'for purposes of this plan']
  },
  {
    code: 'A-002',
    name: 'New Hire and Onboarding Policy',
    category: 'HR/Operational',
    section: 'A - Plan Fundamentals',
    order: 2,
    severity: 'MEDIUM',
    summary: 'Policies for ramping new hires including draw periods, quota ramps, and territory assignment timing.',
    goldStandardLanguage: `### NEW HIRE AND ONBOARDING POLICY

#### Ramp Period
| Month | Quota Level | Guarantee |
|-------|-------------|-----------|
| 1 | 25% of full quota | 100% OTE guarantee |
| 2 | 50% of full quota | 100% OTE guarantee |
| 3 | 75% of full quota | 75% OTE guarantee |
| 4-6 | 100% of full quota | 50% OTE guarantee (recoverable) |
| 7+ | Full quota | Standard plan |

#### Territory Assignment
- Territory assigned within 14 days of start date
- Inherited pipeline: Credit for deals closed in first 60 days

#### Quota Assignment
- **Full Year Hire** (Jan-Feb): Full annual quota
- **Mid-Year Hire** (Mar-Sep): Prorated quota
- **Late Year Hire** (Oct-Dec): Quarterly quota or roll to next year`,
    requiredElements: [
      'Eligibility start date defined',
      'Ramp period with quota percentages',
      'Guarantee terms',
      'Territory assignment timeline',
      'Training requirements'
    ],
    detectionPatterns: ['new hire', 'ramp.*period', 'onboarding', 'first.*90.*days', 'guarantee.*period']
  },
  {
    code: 'A-003',
    name: 'Plan Version Control Policy',
    category: 'Governance',
    section: 'A - Plan Fundamentals',
    order: 3,
    severity: 'LOW',
    summary: 'Document versioning, amendment procedures, and acknowledgment tracking.',
    goldStandardLanguage: `### PLAN VERSION CONTROL POLICY

#### Version Numbering
Format: **Major.Minor.Patch** (e.g., 2025.1.0)
- Major: Plan year
- Minor: Significant amendments
- Patch: Clarifications/corrections

#### Amendment Process
| Amendment Type | Approval Required | Notice Period |
|----------------|-------------------|---------------|
| Major (rates, structure) | EVP + CFO | 60 days |
| Minor (policy clarification) | VP Sales | 30 days |
| Patch (typo, formatting) | Director | 7 days |

#### Participant Acknowledgment
- Initial: Required within 14 days of distribution
- Amendments: Required within 7 days of material changes
- Method: Electronic or wet signature`,
    requiredElements: [
      'Version numbering system',
      'Document header requirements',
      'Amendment approval matrix',
      'Acknowledgment requirements',
      'Retention periods'
    ],
    detectionPatterns: ['version', 'amendment', 'supersedes', 'effective date']
  },
  {
    code: 'A-004',
    name: 'Plan Document Standards',
    category: 'Plan Foundation',
    section: 'A - Plan Fundamentals',
    order: 4,
    severity: 'MEDIUM',
    summary: 'Standard structure and format for all compensation plan documents.',
    goldStandardLanguage: `### PLAN DOCUMENT STANDARDS

#### Required Sections (In Order)
1. Plan Overview - Purpose, eligibility, effective dates
2. Definitions - Key terms (or reference to A-001)
3. Compensation Structure - Base, variable, OTE breakdown
4. Performance Measures - What is measured and how
5. Quota and Targets - How quotas are set and communicated
6. Commission/Bonus Calculation - Rates, tiers, accelerators
7. Crediting Rules - How sales credit is assigned
8. Payment Terms - When and how payment occurs
9. Plan Changes - How plan can be modified
10. Termination Treatment - What happens at separation
11. Governance - Dispute resolution, exceptions
12. Acknowledgment - Signature page

#### Prohibited Content
- Unilateral amendment clauses without notice
- "At will" termination of earned commissions
- Retroactive rate reductions
- Undefined discretionary authority`,
    requiredElements: [
      'All 12 required sections present',
      'Sections in correct order',
      'Calculation examples included',
      'Required appendices attached',
      'No prohibited content'
    ],
    detectionPatterns: ['plan overview', 'eligibility', 'compensation structure', 'calculation', 'acknowledgment'],
    relatedPolicies: ['A-001', 'A-003']
  }
];

// ============================================================================
// SECTION B - HOW YOU EARN (6 policies)
// ============================================================================

export const SECTION_B_POLICIES: PolicyV2[] = [
  {
    code: 'B-001',
    name: 'Sales Crediting Policy',
    category: 'Operational',
    section: 'B - How You Earn',
    order: 1,
    severity: 'HIGH',
    summary: 'Rules for assigning sales credit including split deals, team sales, overlays, and transfer of credit.',
    goldStandardLanguage: `### SALES CREDITING POLICY

#### Primary Crediting Rule
Sales credit assigned to salesperson who:
- Is assigned to account at time of order
- Is documented as "Primary Rep" in CRM

**Default**: 100% credit to Primary Rep unless split applies.

#### Split Credit Rules
| Scenario | Credit Split |
|----------|--------------|
| Overlay/Specialist | Primary: 70% / Overlay: 30% |
| Territory Transition | Outgoing: 50% / Incoming: 50% (first 90 days) |
| Team Sale | Per pre-approved split agreement |

**Requirements**:
- Split documented in CRM BEFORE order
- Both parties acknowledge
- Manager approval for non-standard splits
- Total credit cannot exceed 100%

#### Account Transitions
| Scenario | Treatment |
|----------|-----------|
| Pipeline at Transfer | Original owner credited if closed within 60 days |
| New Opportunities | New owner credited immediately |
| Renewals | New owner unless "in play" at transfer |`,
    requiredElements: [
      'Primary crediting rule defined',
      'Split credit scenarios and percentages',
      'Overlay credit structure',
      'Account transition rules',
      'Credit dispute process'
    ],
    detectionPatterns: ['sales credit', 'split.*commission', 'overlay', 'crediting rules']
  },
  {
    code: 'B-002',
    name: 'Quota Management Policy',
    category: 'Performance Management',
    section: 'B - How You Earn',
    order: 2,
    severity: 'HIGH',
    summary: 'Quota setting methodology, communication timing, and adjustment criteria.',
    goldStandardLanguage: `### QUOTA MANAGEMENT POLICY

#### Communication Timeline
| Milestone | Timeline |
|-----------|----------|
| Draft quotas to managers | 45 days before plan year |
| Manager review period | 14 days |
| Final quotas approved | 21 days before plan year |
| Communicated to participants | 14 days before plan year |

**Late Communication**: If quota not communicated by plan start, participant receives 100% quota credit until communicated.

#### Quota Adjustment Criteria
Quotas adjusted mid-period only for:
- Territory change affecting 10%+ of potential
- Material product launch/discontinuation
- Significant market disruption
- Role change

#### Quota Protection
- No retroactive quota increases
- Quota decreases benefit participant
- Windfall protection (B-006) remains in effect`,
    requiredElements: [
      'Quota setting methodology',
      'Communication timeline',
      'Late communication remedy',
      'Adjustment criteria',
      'Adjustment formula',
      'Dispute process'
    ],
    detectionPatterns: ['quota', 'target', 'goal', 'attainment']
  },
  {
    code: 'B-003',
    name: 'Territory Management Policy',
    category: 'Operational',
    section: 'B - How You Earn',
    order: 3,
    severity: 'MEDIUM',
    summary: 'Territory assignment, changes, and compensation impact during transitions.',
    goldStandardLanguage: `### TERRITORY MANAGEMENT POLICY

#### Notice Requirements
| Change Type | Notice Period |
|-------------|---------------|
| Account addition | 7 days |
| Account removal | 14 days |
| Territory realignment | 30 days |
| Full territory change | 30 days |

#### Pipeline Protection
| Deal Stage | Credit Window |
|------------|---------------|
| 25%+ probability | 60 days to original owner |
| 50%+ probability | 90 days to original owner |
| 75%+ probability | Original owner regardless of timing |

**Pending Orders**: Orders submitted before change go to original owner.`,
    requiredElements: [
      'Territory definition criteria',
      'Change notification periods',
      'Pipeline protection rules',
      'Quota treatment for changes',
      'Transition support process'
    ],
    detectionPatterns: ['territory', 'account assignment', 'geographic', 'reassignment']
  },
  {
    code: 'B-004',
    name: 'Cap and Threshold Policy',
    category: 'Financial Controls',
    section: 'B - How You Earn',
    order: 4,
    severity: 'HIGH',
    summary: 'Earnings caps, minimum thresholds, and accelerator limits.',
    goldStandardLanguage: `### CAP AND THRESHOLD POLICY

#### Earnings Threshold (Floor)
| Plan Type | Typical Threshold |
|-----------|-------------------|
| Commission-only | 0% (first dollar) |
| Commission + base | 50% of quota |
| Bonus-focused | 80% of quota |

#### Earnings Cap (Ceiling)
**Default Cap**: 3x target variable compensation per plan year.

#### Accelerator Structure
| Attainment | Rate Multiplier |
|------------|-----------------|
| 0% - 50% | 0x (below threshold) |
| 50% - 100% | 1.0x |
| 100% - 125% | 1.25x |
| 125% - 150% | 1.5x |
| 150% - 200% | 2.0x |
| > 200% | Capped or CRB review |

#### Cap Exceptions
| Overage | Approval |
|---------|----------|
| Up to 10% | VP Sales |
| Up to 25% | EVP |
| > 25% | CRB |`,
    requiredElements: [
      'Threshold defined',
      'Cap defined (multiple or dollar)',
      'Accelerator structure',
      'Cap exception process',
      'SPIF interaction with cap'
    ],
    detectionPatterns: ['cap', 'ceiling', 'maximum.*earn', 'threshold', 'accelerator']
  },
  {
    code: 'B-005',
    name: 'SPIF Governance Policy',
    category: 'Program Controls',
    section: 'B - How You Earn',
    order: 5,
    severity: 'MEDIUM',
    summary: 'Special Performance Incentive Fund (SPIF) approval, documentation, and tracking requirements.',
    goldStandardLanguage: `### SPIF GOVERNANCE POLICY

#### Approval Requirements
| SPIF Budget | Approval Required | Lead Time |
|-------------|-------------------|-----------|
| < $25,000 | Regional VP | 5 days |
| $25K - $100K | SVP Sales + Finance | 10 days |
| $100K - $500K | EVP + CFO | 15 days |
| > $500K | CEO + Board notification | 30 days |

#### SPIF Limitations
- Duration: Maximum 90 days
- Stacking: Max 2 SPIFs active per participant
- Frequency: Same SPIF max 2 times per year
- Earnings: Cannot exceed 25% of base plan OTE

#### Prohibited
- Retroactive SPIFs
- SPIFs conflicting with base plan
- Unapproved "shadow" SPIFs
- SPIFs funded by commission reduction`,
    requiredElements: [
      'SPIF definition',
      'Approval matrix by budget',
      'Required documentation',
      'Duration and stacking limits',
      'Tracking requirements',
      'Prohibited practices'
    ],
    detectionPatterns: ['SPIF', 'spiff', 'contest', 'bonus.*program', 'incentive.*program']
  },
  {
    code: 'B-006',
    name: 'Windfall and Large Deal Policy',
    category: 'Financial Controls',
    section: 'B - How You Earn',
    order: 6,
    severity: 'HIGH',
    summary: 'Handling of unusually large transactions and windfall commission events.',
    goldStandardLanguage: `### WINDFALL AND LARGE DEAL GOVERNANCE

#### Windfall Definition
Transaction meeting ANY of:
| Criteria | Threshold |
|----------|-----------|
| Transaction value | > $500,000 |
| Commission amount | > $50,000 |
| Quota impact | > 25% of annual quota |
| Account acquisition | > $1M competitor displacement |

#### Review Process
| Commission Amount | Approval Required |
|-------------------|-------------------|
| $50K - $100K | Regional VP |
| $100K - $250K | SVP Sales |
| > $250K | CRB |

#### Payment Modification Options
| Option | When Used |
|--------|-----------|
| **Full Payment** | Default for legitimate sales |
| **Spread Payment** | Extended implementation or cancellation risk |
| **Reduced Rate** | Full rate to threshold, reduced above |
| **Cap Application** | Per B-004 cap terms |

#### Bluebird/Unsolicited Deals
- Rep contribution assessment required
- May apply reduced rate or split credit
- Must document rationale
- Rep can dispute assessment`,
    requiredElements: [
      'Windfall threshold defined',
      'Review process documented',
      'Approval matrix',
      'Payment modification options',
      'Bluebird treatment',
      'Documentation requirements'
    ],
    detectionPatterns: ['windfall', 'large deal', 'bluebird', 'enterprise.*deal']
  }
];

// ============================================================================
// SECTION C - HOW YOU GET PAID (3 policies)
// ============================================================================

export const SECTION_C_POLICIES: PolicyV2[] = [
  {
    code: 'C-001',
    name: 'Payment Timing Policy',
    category: 'Operational',
    section: 'C - How You Get Paid',
    order: 1,
    severity: 'MEDIUM',
    summary: 'Commission calculation and payment schedules, including lag time between earning and payment.',
    goldStandardLanguage: `### PAYMENT TIMING POLICY

#### Commission Cycle
| Element | Timing |
|---------|--------|
| Performance Period | Calendar month |
| Calculation Cutoff | Last business day of month |
| Processing | 1st - 10th of following month |
| Statement Available | By 15th of following month |
| Payment Date | Last business day of following month |

#### When Commission is Earned
Commission "earned" when ALL occur:
- Transaction booked/closed in system
- Customer PO or contract received
- Credit approved (if applicable)
- Product shipped or service activated

**409A Note**: Payment within 2½ months of later of company or participant tax year end.

#### Statement Requirements
Must include:
- Transactions credited
- Rate applied
- Gross commission
- Adjustments
- Draw balance
- YTD earnings
- Quota attainment %`,
    requiredElements: [
      'Commission cycle defined',
      '"Earned" definition',
      '"Payable" definition',
      '409A timing compliance',
      'Adjustment process',
      'Statement requirements'
    ],
    detectionPatterns: ['payment.*schedule', 'paid.*monthly', 'commission.*cycle', 'pay.*date']
  },
  {
    code: 'C-002',
    name: 'Draws and Guarantees Policy',
    category: 'Financial',
    section: 'C - How You Get Paid',
    order: 2,
    severity: 'HIGH',
    summary: 'Draw arrangements, guarantee periods, and recovery provisions.',
    goldStandardLanguage: `### DRAWS AND GUARANTEES POLICY

#### Draw Types
| Type | Definition | Recovery |
|------|------------|----------|
| **Recoverable** | Advance against future commissions | Yes |
| **Non-Recoverable** | Guaranteed minimum | No |
| **Declining** | Reduces over time | Varies |

#### New Hire Guarantee
| Month | Guarantee | Draw Type |
|-------|-----------|-----------|
| 1-3 | 100% OTE rate | Non-Recoverable |
| 4-6 | 75% OTE rate | Recoverable |
| 7+ | Standard plan | N/A |

#### Recoverable Draw Terms
- **Amount**: Base salary / 12 per month or specified amount
- **Recovery**: Commissions first offset balance; max 50% per period
- **Forgiveness**: 50% after 12 months; 100% after 24 months
- **Termination**:
  - Voluntary: Balance due (per state law)
  - Involuntary (no cause): Forgiven
  - For cause: Balance due

#### State Law Considerations
- **California**: Written agreement required for recovery from final pay
- **New York**: Recovery from final pay limited
- **All States**: Draw terms must be in writing`,
    requiredElements: [
      'Draw types defined',
      'New hire guarantee terms',
      'Recovery mechanism',
      'Forgiveness terms',
      'Termination treatment',
      'State law compliance'
    ],
    detectionPatterns: ['draw', 'guarantee', 'advance', 'recoverable', 'non-recoverable']
  },
  {
    code: 'C-003',
    name: 'Section 409A Compliance',
    category: 'Tax/Legal',
    section: 'C - How You Get Paid',
    order: 3,
    severity: 'CRITICAL',
    summary: 'IRS Section 409A nonqualified deferred compensation compliance. Non-compliance results in 20% penalty plus interest on participant.',
    goldStandardLanguage: `### SECTION 409A COMPLIANCE

#### Short-Term Deferral Safe Harbor
All commissions under this Plan qualify for "short-term deferral" exception under Treasury Reg. §1.409A-1(b)(4).

**Requirement**: Pay within 2½ months of later of:
- Company fiscal year end when earned, OR
- Participant tax year end when earned

**Example**: December 2025 commission paid by March 15, 2026.

#### 409A Savings Clause
If any payment constitutes "nonqualified deferred compensation" under 409A:
- No acceleration except as 409A permits
- Six-month delay for specified employees at separation
- Plan interpreted consistent with 409A

#### Specified Employee Rules
If participant is "specified employee" at separation:
- Payments delayed 6 months per §409A(a)(2)(B)(i)
- Applies only to public companies`,
    requiredElements: [
      'Short-term deferral safe harbor language',
      '2.5 month payment rule stated',
      'Substantial risk of forfeiture defined',
      '409A savings clause',
      'Specified employee mention',
      'Liability disclaimer'
    ],
    detectionPatterns: ['409A', 'short-term deferral', 'nonqualified deferred', '2.5 month', 'substantial risk'],
    riskNotes: 'CRITICAL: Penalties = 20% additional tax + interest from deferral date + immediate taxation.'
  }
];

// ============================================================================
// SECTION D - CHANGES AND EXCEPTIONS (3 policies)
// ============================================================================

export const SECTION_D_POLICIES: PolicyV2[] = [
  {
    code: 'D-001',
    name: 'Mid-Period Change Policy',
    category: 'Plan Administration',
    section: 'D - Changes and Exceptions',
    order: 1,
    severity: 'HIGH',
    summary: 'Rules for changing plans mid-year including quota adjustments, role changes, and territory realignment.',
    goldStandardLanguage: `### MID-PERIOD CHANGE POLICY

#### Change Authority
| Type | Approval | Notice |
|------|----------|--------|
| Plan Design | EVP + CFO | 60 days |
| Quota | VP Sales | 30 days |
| Territory | Regional VP | 14 days |
| Role | Director + HR | Per HR policy |

#### General Principles
- **No Retroactive Harm**: Cannot reduce earned compensation
- **Prospective Application**: Changes apply from effective date forward
- **Documentation**: All changes documented with rationale

#### Role Changes
| Change | Quota | Rate |
|--------|-------|------|
| Promotion | New role quota | New rates immediately |
| Demotion | New role quota (prorated) | New rates after 30 days |
| Lateral | New territory quota | Same rates |

#### Prohibited Changes
- Retroactive quota increases
- Rate decreases on earned commissions
- Changes to avoid paying earned comp
- Changes without proper notice`,
    requiredElements: [
      'Change types enumerated',
      'Approval authority matrix',
      'Notice periods',
      'Retroactive change prohibition',
      'Pipeline protection',
      'Role change treatment'
    ],
    detectionPatterns: ['mid-period', 'mid-year', 'plan change', 'amendment', 'modification']
  },
  {
    code: 'D-002',
    name: 'Leave of Absence Policy',
    category: 'HR/Legal',
    section: 'D - Changes and Exceptions',
    order: 2,
    severity: 'CRITICAL',
    summary: 'Treatment of commission during FMLA, military (USERRA), disability, and other protected leaves.',
    goldStandardLanguage: `### LEAVE OF ABSENCE PROVISIONS

#### FMLA-Protected Leave
- **Quota**: Prorated (Adjusted = Annual x Active Days / 260)
- **Commissions**: Earned prior to leave paid on normal schedule
- **Pipeline**: Credited if closed within 90 days of return
- **Return**: Same or equivalent position, same plan, adjusted quota

#### USERRA Military Leave
- **Reemployment**: Full restoration per USERRA
- **Quota**: Prorated for active period
- **Discrimination**: No adverse comp decisions based on service
- **Seniority**: Leave time counts toward service-based elements

#### Other Protected Leaves
| Leave Type | Quota | Pipeline | Commission |
|------------|-------|----------|------------|
| Short-Term Disability | Prorated | Protected 30 days | Per STD policy |
| Long-Term Disability | Suspended | Forfeited after 90 days | Per LTD policy |
| Parental Leave | Prorated | Protected | Per policy |
| Workers' Comp | Prorated | Protected | Per WC policy |`,
    requiredElements: [
      'FMLA treatment defined',
      'USERRA treatment defined',
      'Quota adjustment formula',
      'Pipeline protection rules',
      'Return to work provisions',
      'Leave duration thresholds'
    ],
    detectionPatterns: ['leave of absence', 'FMLA', 'military', 'USERRA', 'disability', 'parental leave'],
    riskNotes: 'CRITICAL: Federal law violations (FMLA, USERRA) carry significant legal exposure.'
  },
  {
    code: 'D-003',
    name: 'Exception and Dispute Resolution Policy',
    category: 'Governance',
    section: 'D - Changes and Exceptions',
    order: 3,
    severity: 'HIGH',
    summary: 'Process for handling exceptions and resolving commission disputes.',
    goldStandardLanguage: `### EXCEPTION AND DISPUTE RESOLUTION POLICY

#### Filing Requirements
- **Timeline**: Within 30 days of commission statement
- **Method**: Written via ticketing system
- **Required**: Transaction ID, statement date, issue description, expected vs. actual, documentation

#### Escalation Path
| Level | Timeline | Authority |
|-------|----------|-----------|
| **1: Sales Ops** | 5 days | Data errors, policy clarification |
| **2: Regional Manager** | 5 days | Up to $5,000 |
| **3: Director, Sales Comp** | 5 days | Up to $25,000 |
| **4: VP Sales Ops** | 5 days | Any amount |
| **5: CRB** | As needed | Final and binding |

#### Resolution Timeline
| Dispute Value | Target |
|---------------|--------|
| < $5,000 | 10 business days |
| $5,000 - $25,000 | 15 business days |
| > $25,000 | 20 business days |

#### Protected Actions
Filing good-faith dispute shall NOT:
- Delay undisputed payments
- Result in retaliation
- Affect performance reviews
- Impact territory assignments`,
    requiredElements: [
      'Dispute categories defined',
      'Filing timeline',
      'Escalation levels with authority',
      'Resolution timelines',
      'Exception request process',
      'Anti-retaliation provisions'
    ],
    detectionPatterns: ['exception', 'dispute', 'appeal', 'escalation', 'resolution', 'CRB']
  }
];

// ============================================================================
// SECTION E - ENDING THE PLAN (2 policies)
// ============================================================================

export const SECTION_E_POLICIES: PolicyV2[] = [
  {
    code: 'E-001',
    name: 'Termination and Final Pay Policy',
    category: 'HR/Legal',
    section: 'E - Ending the Plan',
    order: 1,
    severity: 'CRITICAL',
    summary: 'Commission treatment upon separation by termination type. Must align with state wage laws.',
    goldStandardLanguage: `### TERMINATION TREATMENT BY TYPE

#### Voluntary Resignation (proper notice)
| Element | Treatment |
|---------|-----------|
| Closed transactions | PAID in full |
| Pipeline | NOT PAID unless closed within 30 days |
| Accelerators | Prorated |
| Unvested | FORFEITED |

**Notice**: 2 weeks written notice required.

#### Involuntary (without cause)
| Element | Treatment |
|---------|-----------|
| Closed transactions | PAID in full |
| Pipeline | PAID if closed within 60 days |
| Accelerators | Prorated |
| Unvested | FORFEITED (unless severance provides otherwise) |

#### Termination for Cause
| Element | Treatment |
|---------|-----------|
| Earned and unpaid | PAID (to extent required by law) |
| Accelerators | FORFEITED |
| Pipeline | NOT PAID |
| Subject to clawback | YES for fraud |

**"Cause"**: Gross misconduct, fraud, policy violation, breach of fiduciary duty, felony conviction.

#### Final Pay Timing by State
| State | Involuntary | Voluntary |
|-------|-------------|-----------|
| **California** | Final day | 72 hrs (or final day if 72+ hrs notice) |
| **Colorado** | Immediately | Next payday |
| **Massachusetts** | Final day | Final day |
| **New York** | Next payday | Next payday |
| **Texas** | Within 6 days | Within 6 days |

#### Earned vs. Payable
**California Note**: Commission "earned" when sale is completed, regardless of when "payable" per plan. Must pay at termination.`,
    requiredElements: [
      'Voluntary treatment',
      'Involuntary (no cause) treatment',
      'For-cause treatment',
      'Death/disability treatment',
      '"Cause" definition',
      'State-specific timing',
      'Earned vs. payable distinction'
    ],
    detectionPatterns: ['termination', 'separation', 'resignation', 'final pay', 'last day'],
    riskNotes: 'CRITICAL: California waiting time penalties up to 30 days wages.'
  },
  {
    code: 'E-002',
    name: 'Clawback and Recovery Policy',
    category: 'Financial Controls',
    section: 'E - Ending the Plan',
    order: 2,
    severity: 'HIGH',
    summary: 'Framework for recovering overpaid commissions due to cancellations, errors, or violations.',
    goldStandardLanguage: `### CLAWBACK AND COMMISSION RECOVERY

#### Triggering Events
Commissions subject to recovery for:
- **Transaction Reversal**: Cancellation, return, credit memo within 12 months
- **Data Correction**: Data entry or system errors
- **Fraud/Misconduct**: Manipulation of sales data, policy violations
- **Customer Non-Payment**: Non-payment within 180 days

#### Approval Matrix
| Amount | Approval |
|--------|----------|
| < $5,000 | Regional Manager |
| $5K - $25K | Director, Sales Comp |
| $25K - $50K | VP Sales Ops |
| > $50K | CRB |

#### Recovery Mechanism
- **Maximum Deduction**: 25% of net variable per pay period
- **Notice**: 30 days before recovery begins
- **Timeline**: Complete within 12 months of triggering event
- **Termination**: Deduct from final pay (per state law)

#### Appeals Process
- File within 30 days of notification
- Review by VP, HR within 15 business days
- Decision on appeal is final

#### State Law Compliance
- **California**: Written authorization required; Labor Code restrictions apply
- **Other States**: Per applicable wage laws`,
    requiredElements: [
      'Triggering events defined',
      'Approval matrix',
      'Maximum deduction rate',
      'Notice period',
      'Recovery timeline',
      'Appeals process',
      'State law compliance'
    ],
    detectionPatterns: ['clawback', 'chargeback', 'recovery', 'reversal', 'overpayment']
  }
];

// ============================================================================
// SECTION F - COMPLIANCE AND CONTROLS (3 policies)
// ============================================================================

export const SECTION_F_POLICIES: PolicyV2[] = [
  {
    code: 'F-001',
    name: 'State Wage Law Compliance',
    category: 'Legal/Regulatory',
    section: 'F - Compliance and Controls',
    order: 1,
    severity: 'CRITICAL',
    summary: 'State-specific requirements for commission payment timing, deductions, and final pay.',
    goldStandardLanguage: `### STATE WAGE LAW COMPLIANCE

#### Final Payment by State
| State | Voluntary | Involuntary |
|-------|-----------|-------------|
| **California** | 72 hrs (or final day if 72+ hrs notice) | Final day |
| **Colorado** | Next payday | Immediately |
| **Illinois** | Next payday | Next payday |
| **Massachusetts** | Final day | Final day |
| **New York** | Next payday | Next payday |
| **Texas** | Within 6 days | Within 6 days |
| **Washington** | End of pay period | End of pay period |

#### California Specifics (Labor Code §201-203)
- **Waiting Time Penalties**: Up to 30 days' wages if late
- **Earned Commissions**: Must pay at termination regardless of plan timing
- **Written Agreement**: Required per Labor Code §2751
- **Deduction Limits**: Prior written authorization required

#### Commission Agreement Requirements (CA §2751)
Must be in writing and signed:
- Method of calculating commissions
- When commissions are earned
- When commissions will be paid
- Method of payment

#### Deduction Restrictions
| State | Can Deduct from Final Pay? | Requirements |
|-------|---------------------------|--------------|
| **California** | Limited | Written auth + cannot reduce below min wage |
| **New York** | Limited | Written auth within 7 days |
| **Texas** | Yes | Written authorization |
| **Illinois** | Limited | Cannot deduct at termination w/o court order |`,
    requiredElements: [
      'State-specific final pay timing',
      'California Labor Code reference',
      'Written agreement requirement',
      'Deduction limitations',
      'Waiting time penalty acknowledgment'
    ],
    detectionPatterns: ['state law', 'California', 'Labor Code', 'wage law', 'final pay'],
    riskNotes: 'CRITICAL: CA waiting time penalties up to 30 days wages. Class action exposure for systematic violations. PAGA claims in California.'
  },
  {
    code: 'F-002',
    name: 'Data and Systems Controls Policy',
    category: 'Operations/Compliance',
    section: 'F - Compliance and Controls',
    order: 2,
    severity: 'HIGH',
    summary: 'Data governance, system access, audit trails, and reconciliation requirements.',
    goldStandardLanguage: `### DATA AND SYSTEMS CONTROLS

#### System of Record
- **Commission Calculation**: ICM System
- **Transaction Data**: CRM/ERP
- **Employee Data**: HRIS
- System of record takes precedence in conflicts

#### Data Retention
| Data Type | Retention |
|-----------|-----------|
| Commission calculations | 7 years |
| Transaction details | 7 years |
| Plan documents | 10 years |
| Dispute records | 7 years |
| Audit logs | 5 years |

#### Segregation of Duties
| Function | Owner |
|----------|-------|
| Plan Design | Sales Ops + Finance |
| Data Entry | Sales Ops |
| Calculation | Comp Team |
| Payment Approval | Finance (separate from calc) |
| Audit | Internal Audit (no calc access) |

#### Audit Trail
All changes logged with:
- User ID, Timestamp
- Old value, New value
- Reason/justification

**Critical Changes** (require approval): Rate changes, quota adjustments, manual credits, retroactive corrections.`,
    requiredElements: [
      'System of record defined',
      'Retention periods',
      'Segregation of duties',
      'Role-based access',
      'Audit trail requirements',
      'Reconciliation schedule'
    ],
    detectionPatterns: ['data', 'system', 'audit', 'reconciliation', 'access control']
  },
  {
    code: 'F-003',
    name: 'International Compliance Policy',
    category: 'Legal/Regulatory',
    section: 'F - Compliance and Controls',
    order: 3,
    severity: 'HIGH',
    summary: 'Multi-jurisdiction compliance requirements for global sales compensation programs.',
    goldStandardLanguage: `### INTERNATIONAL COMPLIANCE POLICY

#### Regional Compliance Requirements
| Region | Key Requirements |
|--------|------------------|
| **European Union** | GDPR, Works Council, social charges |
| **United Kingdom** | IR35, PAYE, NI contributions |
| **Germany** | Works Council (BetrVG §87), co-determination |
| **France** | URSSAF social charges (45-50%), collective agreements |
| **Italy** | Enasarco registration, agent indemnity |
| **Australia/NZ** | Fair Work Act, superannuation |
| **Canada** | Provincial employment standards, Quebec specifics |

#### EU-Specific Requirements
**Works Council Consultation** (Germany, Netherlands, France)
- Plan changes require Works Council notification
- 30 day consultation period before implementation
- Document consultation process

**Social Charges**
- Variable compensation subject to employer social charges
- Budget for 40-50% additional cost on variable pay (France)

**GDPR Compliance**
- Commission data is personal data
- Data processing agreements required
- Right to access commission records

#### Termination Indemnities
| Country | Requirement |
|---------|-------------|
| **Italy** | Agent entitled to indemnity based on commission history |
| **France** | Notice period and severance per collective agreement |
| **Spain** | Commission integrated into severance calculation |
| **Germany** | Notice periods per employment duration |`,
    requiredElements: [
      'Regional requirements identified',
      'Works Council process (EU)',
      'Social charges budgeted',
      'GDPR compliance addressed',
      'Agent vs. employee distinction',
      'Currency and payment terms',
      'Termination indemnities',
      'Country-specific addenda'
    ],
    detectionPatterns: ['international', 'global', 'GDPR', 'works council', 'social charges', 'Enasarco', 'IR35'],
    riskNotes: 'HIGH: Works Council violations can invalidate plan changes. Enasarco non-compliance: 2-3 years commission exposure. IR35 misclassification: Back taxes + penalties. GDPR violations: Up to 4% of global revenue.',
    relatedPolicies: ['F-001', 'E-001', 'F-002']
  }
];

// ============================================================================
// COMBINED LIBRARY
// ============================================================================

export const ALL_POLICIES_V2: PolicyV2[] = [
  ...SECTION_A_POLICIES,
  ...SECTION_B_POLICIES,
  ...SECTION_C_POLICIES,
  ...SECTION_D_POLICIES,
  ...SECTION_E_POLICIES,
  ...SECTION_F_POLICIES
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getPolicyByCodeV2(code: string): PolicyV2 | undefined {
  return ALL_POLICIES_V2.find(p => p.code === code);
}

export function getPoliciesBySectionV2(section: string): PolicyV2[] {
  return ALL_POLICIES_V2.filter(p => p.section.includes(section));
}

export function getCriticalPoliciesV2(): PolicyV2[] {
  return ALL_POLICIES_V2.filter(p => p.severity === 'CRITICAL');
}

export function getHighPoliciesV2(): PolicyV2[] {
  return ALL_POLICIES_V2.filter(p => p.severity === 'HIGH');
}

// ============================================================================
// RAG CONTEXT BUILDER
// ============================================================================

export function buildPolicyLibraryRAGContext(): string {
  const sections = [
    { name: 'A - Plan Fundamentals', policies: SECTION_A_POLICIES },
    { name: 'B - How You Earn', policies: SECTION_B_POLICIES },
    { name: 'C - How You Get Paid', policies: SECTION_C_POLICIES },
    { name: 'D - Changes and Exceptions', policies: SECTION_D_POLICIES },
    { name: 'E - Ending the Plan', policies: SECTION_E_POLICIES },
    { name: 'F - Compliance and Controls', policies: SECTION_F_POLICIES }
  ];

  const critical = getCriticalPoliciesV2();
  const high = getHighPoliciesV2();

  let context = `## Policy Library v2 - 21 Policies

### Critical Policies (${critical.length})
${critical.map(p => `- ${p.code}: ${p.name}`).join('\n')}

### High Severity Policies (${high.length})
${high.map(p => `- ${p.code}: ${p.name}`).join('\n')}

### All Sections
`;

  for (const section of sections) {
    context += `\n**${section.name}** (${section.policies.length} policies)\n`;
    context += section.policies.map(p => `- ${p.code}: ${p.name} (${p.severity})`).join('\n');
    context += '\n';
  }

  return context;
}

// ============================================================================
// KNOWLEDGE SUMMARY (for system prompt)
// ============================================================================

export const POLICY_LIBRARY_V2_SUMMARY = `
## SPM Governance Policy Library v2 - 21 Policies

### Section A - Plan Fundamentals (4)
- A-001: Standard Terms and Definitions (MEDIUM)
- A-002: New Hire and Onboarding Policy (MEDIUM)
- A-003: Plan Version Control Policy (LOW)
- A-004: Plan Document Standards (MEDIUM)

### Section B - How You Earn (6)
- B-001: Sales Crediting Policy (HIGH)
- B-002: Quota Management Policy (HIGH)
- B-003: Territory Management Policy (MEDIUM)
- B-004: Cap and Threshold Policy (HIGH)
- B-005: SPIF Governance Policy (MEDIUM)
- B-006: Windfall and Large Deal Policy (HIGH)

### Section C - How You Get Paid (3)
- C-001: Payment Timing Policy (MEDIUM)
- C-002: Draws and Guarantees Policy (HIGH)
- C-003: Section 409A Compliance (CRITICAL)

### Section D - Changes and Exceptions (3)
- D-001: Mid-Period Change Policy (HIGH)
- D-002: Leave of Absence Policy (CRITICAL)
- D-003: Exception and Dispute Resolution Policy (HIGH)

### Section E - Ending the Plan (2)
- E-001: Termination and Final Pay Policy (CRITICAL)
- E-002: Clawback and Recovery Policy (HIGH)

### Section F - Compliance and Controls (3)
- F-001: State Wage Law Compliance (CRITICAL)
- F-002: Data and Systems Controls Policy (HIGH)
- F-003: International Compliance Policy (HIGH)

### Critical Policies (Highest Risk - 4)
1. C-003: Section 409A Compliance - 20% penalty + interest
2. D-002: Leave of Absence - FMLA/USERRA violations
3. E-001: Termination and Final Pay - CA waiting time penalties
4. F-001: State Wage Law Compliance - Class action exposure
`;
