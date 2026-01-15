/**
 * Compensation Plan Template Structure
 * Standard sections for a compensation plan document
 */

export interface PlanSection {
  id: string;
  sectionNumber: string;
  title: string;
  order: number;
  isRequired: boolean;
  existingContent?: string; // What the plan currently has
  status: 'COMPLETE' | 'PARTIAL' | 'MISSING';
  relatedPolicies: string[]; // Policy codes that apply to this section
  draftContent?: string; // Draft content to add/replace
}

/**
 * Standard Compensation Plan Template
 * 12 core sections every comp plan should have
 */
export const COMPENSATION_PLAN_TEMPLATE: PlanSection[] = [
  {
    id: 'section-01',
    sectionNumber: '1.0',
    title: 'Plan Overview & Objectives',
    order: 1,
    isRequired: true,
    status: 'COMPLETE',
    relatedPolicies: [],
    existingContent: `# Medical FSC Standard Compensation Plan

## Plan Overview
This plan governs compensation for Field Sales Consultants (FSC) in the Medical division for fiscal year 2025.

## Objectives
- Drive revenue growth in assigned territories
- Incentivize new account acquisition
- Reward customer retention and satisfaction
- Align sales activities with corporate strategic goals`,
  },
  {
    id: 'section-02',
    sectionNumber: '2.0',
    title: 'Eligibility & Participation',
    order: 2,
    isRequired: true,
    status: 'PARTIAL',
    relatedPolicies: ['NEW_HIRE_ONBOARDING', 'TERMINATION_FINAL_PAY'],
    existingContent: `## Eligibility

### Who Is Eligible
- Full-time Field Sales Consultants in Medical division
- Employees in good standing
- Assigned to an active territory

### Effective Date
Participation begins on employee's start date or plan effective date, whichever is later.`,
    draftContent: `## Eligibility

### Who Is Eligible
- Full-time Field Sales Consultants in Medical division
- Employees in good standing
- Assigned to an active territory

### Effective Date
Participation begins on employee's start date or plan effective date, whichever is later.

**[DRAFT ADDITION - New Hire Onboarding]**

### New Hire Ramp Period
- New hires receive 90-day ramp period with guaranteed minimum draw
- Ramp schedule:
  - Month 1-2: $5,000/month guaranteed minimum
  - Month 3-4: 75% of target incentive guaranteed
  - Month 5-6: 50% of target incentive guaranteed
  - Month 7+: Full plan participation, no guarantees
- Quotas during ramp: 50% of full quota (months 1-3), 75% (months 4-6)

**[DRAFT ADDITION - Termination]**

### Termination of Participation
- **Voluntary Resignation**: Commissions paid only on sales invoiced prior to last day worked. No pending or future commissions paid.
- **Involuntary Termination - Cause**: No commission payment on pending or future sales.
- **Involuntary Termination - No Cause**: Commissions paid on sales invoiced within 30 days of termination date.
- **Retirement**: Full commission payment on all pending sales in pipeline, paid per normal schedule.
- Final payment made within 30 days of termination or per state wage law requirements, whichever is sooner.`,
  },
  {
    id: 'section-03',
    sectionNumber: '3.0',
    title: 'Territory & Account Assignment',
    order: 3,
    isRequired: true,
    status: 'MISSING',
    relatedPolicies: ['TERRITORY_MANAGEMENT'],
    draftContent: `## Territory & Account Assignment

**[DRAFT MISSING SECTION]**

### Territory Definition
- Territories assigned by Sales Leadership and documented in CRM
- Territory maps include geographic boundaries and assigned accounts
- Exclusive territories unless designated as overlay/team selling

### Territory Changes
- Mid-year territory changes allowed only for business necessity (org restructure, acquisition, rep departure)
- 30-day advance notice provided when possible
- During transition:
  - **Shadow Period**: 30 days where both old and new rep credited (50/50 split)
  - **Pending Deals**: Assigned based on relationship ownership (documented in CRM)
  - **Established Accounts**: New rep receives credit starting day 31

### Territory Mergers & Splits
- **Merger**: Rep with longer tenure receives combined territory; displaced rep reassigned or severance offered
- **Split**: Accounts divided by geography and relationship (primary contact determines assignment)
- **Grandfathered Commissions**: Old rep continues to receive commissions for up to 90 days on existing accounts transferred away

### Account Reassignment Appeals
- Reps may appeal account reassignments within 10 business days of notification
- VP Sales reviews and makes final determination within 5 business days
- Decision documented and binding`,
  },
  {
    id: 'section-04',
    sectionNumber: '4.0',
    title: 'Quota & Performance Targets',
    order: 4,
    isRequired: true,
    status: 'MISSING',
    relatedPolicies: ['QUOTA_MANAGEMENT'],
    draftContent: `## Quota & Performance Targets

**[DRAFT MISSING SECTION]**

### Annual Quota Setting
- Individual quotas set annually by Sales Leadership in collaboration with Finance
- Based on: territory potential, historical performance, market conditions, strategic priorities
- Quotas finalized and communicated by December 15 for following calendar year
- Quota acceptance required via written acknowledgment within 10 business days

### Quota Structure
- Revenue quota: [$ amount] annually
- Unit quota: [units] annually
- Mix requirements: [product categories and %]

### Mid-Year Quota Adjustments
Allowed only under these conditions:
- **Territory Change**: Quota adjusted proportional to accounts added/removed
- **Market Disruption**: Force majeure, natural disaster, pandemic affecting >20% of territory
- **Product Discontinuation**: Quota reduced if product line representing >10% of quota is discontinued
- All adjustments require SVP approval and written documentation
- Maximum reduction: 20% without CRB approval
- No retroactive adjustments beyond current quarter

### Quota Relief Process
1. Rep submits written request with supporting data
2. Manager reviews and forwards with recommendation within 5 business days
3. VP Sales makes determination within 10 business days
4. Decision documented in personnel file and copied to Finance`,
  },
  {
    id: 'section-05',
    sectionNumber: '5.0',
    title: 'Commission Structure & Rates',
    order: 5,
    isRequired: true,
    status: 'COMPLETE',
    relatedPolicies: [],
    existingContent: `## Commission Structure

### Base Salary
- Annual base salary: $65,000

### Target Incentive
- Annual target incentive: $85,000 (at 100% quota attainment)
- Total on-target earnings (OTE): $150,000

### Commission Rates
Tiered commission structure based on quota attainment:

| Quota Attainment | Commission Rate |
|------------------|----------------|
| 0% - 79% | 3% of revenue |
| 80% - 99% | 6% of revenue |
| 100% - 119% | 10% of revenue |
| 120%+ | 12% of revenue (accelerator) |

### Product Mix Modifiers
- Strategic products: +1% commission rate
- Margin-negative products: -1% commission rate`,
  },
  {
    id: 'section-06',
    sectionNumber: '6.0',
    title: 'Sales Crediting Rules',
    order: 6,
    isRequired: true,
    status: 'PARTIAL',
    relatedPolicies: ['SALES_CREDITING'],
    existingContent: `## Sales Crediting

### Standard Credit
Sales credited to assigned territory representative based on ship-to address.`,
    draftContent: `## Sales Crediting

### Standard Credit
Sales credited to assigned territory representative based on ship-to address.

**[DRAFT ADDITION - Split Credit Rules]**

### Split Credit Scenarios
1. **Team Selling (Multiple Reps)**
   - Written split agreement required BEFORE deal closes
   - Signed by both reps and manager
   - Default split if no agreement: 50/50

2. **Overlay Specialists**
   - Territory FSC: 70%
   - Product Specialist: 30%
   - Specialist must participate in minimum 2 customer meetings to qualify

3. **Cross-Division Sales**
   - Division making primary sale: 75%
   - Supporting division: 25%
   - Split defined in inter-division agreement on file

4. **House Accounts**
   - National accounts managed centrally: 0% field credit (house account team credited)
   - If field FSC sources new location within house account: 50% credit for first year

### Credit Disputes
- Rep must raise dispute within 30 days of transaction posting
- Manager reviews and makes initial determination within 10 business days
- Appeals to VP Sales within 5 business days
- VP decision is final and documented
- Precedent-setting decisions shared with all reps for future consistency`,
  },
  {
    id: 'section-07',
    sectionNumber: '7.0',
    title: 'Windfall & Large Deal Governance',
    order: 7,
    isRequired: true,
    status: 'PARTIAL',
    relatedPolicies: ['WINDFALL_LARGE_DEALS'],
    existingContent: `## Large Deal Review

Commissions over $50,000 require management review.`,
    draftContent: `## Large Deal Review

Commissions over $50,000 require management review.

**[DRAFT ADDITION - Formal Windfall Policy]**

### Windfall Definition
A "windfall" is any single transaction resulting in >$100,000 commission to an individual rep.

### Approval Thresholds
- **$100K - $250K**: SVP Sales approval required
- **$250K - $500K**: CRB approval required
- **$500K+**: CEO + CRB approval required

### Review Process
1. Rep submits windfall request 10 business days before deal closes
2. Request includes: customer info, deal size, business justification, sales effort documentation
3. Approver reviews within 5 business days
4. If approved: Commission paid per normal schedule
5. If capped: Rep notified of cap amount and rationale in writing

### Commission Caps
- Maximum single transaction commission: $500,000 (without CRB exception)
- Annual individual cap: $750,000 total commissions (without CEO exception)
- Excess amounts above cap: Not paid unless exception granted

### Documentation Requirements
All windfall approvals documented in deal file with:
- Business justification
- Competitive dynamics
- Strategic importance
- Sales effort log (meetings, proposals, travel)`,
  },
  {
    id: 'section-08',
    sectionNumber: '8.0',
    title: 'Payment Timing & Schedule',
    order: 8,
    isRequired: true,
    status: 'MISSING',
    relatedPolicies: ['PAYMENT_TIMING', 'COMPLIANCE_409A'],
    draftContent: `## Payment Timing & Schedule

**[DRAFT MISSING SECTION]**

### Payment Frequency
- Commissions calculated and paid **monthly**
- Payment occurs on the **15th of the month** following the month of invoice
- Example: January sales invoiced → paid February 15th

### Payment Calculation Date
- Commissions calculated based on **invoiced sales** (not booked orders)
- Invoice must be dated within the commission month to count toward that month
- Returns/credits processed in month received

### Payment Holdback
- 10% holdback on all commission payments
- Holdback released annually on December 31st (if still employed)
- Holdback forfeited if terminated for cause
- Holdback paid out within 30 days if terminated without cause

### Year-End True-Up
- Annual reconciliation completed by January 31st
- Quota attainment recalculated based on full-year actual performance
- Tier adjustments applied retroactively
- True-up payment (or recovery) processed by February 28th

### Section 409A Compliance
This plan is designed to comply with IRS Section 409A:
- All payments made within "short-term deferral" safe harbor (2.5 months after year-end)
- No discretion over payment timing once earned
- Termination payments follow plan terms without employer discretion
- Holdback released on fixed schedule (not contingent on employer discretion)`,
  },
  {
    id: 'section-09',
    sectionNumber: '9.0',
    title: 'Clawback & Recovery',
    order: 9,
    isRequired: true,
    status: 'MISSING',
    relatedPolicies: ['CLAWBACK_RECOVERY'],
    draftContent: `## Clawback & Recovery

**[DRAFT MISSING SECTION]**

### When Clawback Applies
Company may recover commissions in these situations:
1. **Customer Returns**: Product returned within 90 days of invoice
2. **Customer Non-Payment**: Invoice unpaid >120 days and written off
3. **Calculation Error**: Overpayment due to system or data error
4. **Fraud/Misrepresentation**: Rep provided false information affecting commission calculation
5. **Policy Violation**: Rep violated company policy (e.g., unauthorized discounting)

### Recovery Methods
1. **Offset Against Future Commissions**: Preferred method; spread over 3 months if amount >$5,000
2. **Payroll Deduction**: If no future commissions expected; subject to state wage law limits
3. **Direct Repayment**: If no longer employed; 30-day notice provided

### Recovery Limits
- Maximum single-month deduction: 25% of gross commission payment
- Exceptions for fraud: No limit on recovery amount or timeline

### Notification
- Written notice provided within 10 business days of discovering overpayment
- Notice includes: amount, reason, recovery method, appeal rights
- Rep may appeal within 10 business days

### Returns & Credits
- Commissions reversed in the month the return is processed
- If return occurs in different calendar year than sale: reversed against current year commissions
- Negative commission balances carried forward until offset`,
  },
  {
    id: 'section-10',
    sectionNumber: '10.0',
    title: 'Plan Administration & Compliance',
    order: 10,
    isRequired: true,
    status: 'MISSING',
    relatedPolicies: ['DATA_SYSTEMS_CONTROLS', 'EXCEPTIONS_DISPUTES', 'MID_PERIOD_CHANGES'],
    draftContent: `## Plan Administration & Compliance

**[DRAFT MISSING SECTION]**

### Plan Administrator
- **Sales Compensation Team** administers this plan
- Contact: salescomp@company.com | ext. 5500

### Data & Systems
- Sales data sourced from: SAP (invoicing), Salesforce (CRM)
- Commission calculations performed in: Xactly Incent
- Statements available via: Xactly portal (accessible 5th of each month)

### Exception Requests
1. **Process**: Submit written request to manager with business justification
2. **Review**: Manager reviews and forwards with recommendation within 5 business days
3. **Approval Authority**:
   - Manager: Exceptions <$5,000
   - VP Sales: Exceptions $5,000-$25,000
   - CRB: Exceptions >$25,000
4. **Timeline**: Decision within 15 business days of request
5. **Documentation**: All exceptions logged in compensation database

### Dispute Resolution
1. **Informal Resolution**: Discuss with manager within 30 days of statement
2. **Formal Dispute**: Submit written dispute to Sales Compensation within 45 days
3. **Investigation**: Sales Comp investigates and responds within 15 business days
4. **Appeal**: Appeal to VP Sales within 10 business days if unresolved
5. **Final Decision**: VP Sales decision is final

### Mid-Period Plan Changes
- Company reserves right to modify plan with 30-day notice
- Material changes (>10% impact to target incentive): 60-day notice
- Changes apply prospectively only (no retroactive changes to earned commissions)
- If changes reduce target incentive >20%: Rep may elect severance in lieu of plan acceptance

### Audit Rights
- Company may audit commission calculations at any time
- Reps must retain supporting documentation for sales credits for 2 years
- Fraudulent claims result in immediate plan termination and potential employment termination`,
  },
  {
    id: 'section-11',
    sectionNumber: '11.0',
    title: 'Leave of Absence & Special Circumstances',
    order: 11,
    isRequired: true,
    status: 'MISSING',
    relatedPolicies: ['LEAVE_OF_ABSENCE'],
    draftContent: `## Leave of Absence & Special Circumstances

**[DRAFT MISSING SECTION]**

### Medical Leave (FMLA, Disability)
- **Short-Term Disability (<30 days)**: Commissions continue on existing accounts
- **Long-Term Disability (30+ days)**:
  - Existing accounts: Commissions paid for 60 days
  - After 60 days: Accounts reassigned; no further commissions
  - Upon return: Original territory restored if possible
- **Quota Relief**: Quota reduced pro-rata for time on leave >30 days

### Personal Leave (Unpaid)
- No commissions earned during unpaid leave
- Territory may be temporarily assigned to another rep
- Upon return within 90 days: Territory restored; pending commissions paid

### Military Leave
- Commissions continue per USERRA requirements
- Territory held for duration of military service
- Upon return: Full restoration of territory and quota

### Workers' Compensation
- Commissions continue for 90 days on existing accounts
- After 90 days: Treated as long-term disability

### Parental Leave
- Commissions continue for 12 weeks (company parental leave policy)
- Quota relief: 25% reduction if leave >4 weeks
- Territory held during leave period`,
  },
  {
    id: 'section-12',
    sectionNumber: '12.0',
    title: 'Plan Acknowledgment & Acceptance',
    order: 12,
    isRequired: true,
    status: 'COMPLETE',
    relatedPolicies: [],
    existingContent: `## Plan Acknowledgment

### Required Acknowledgment
All participants must acknowledge and accept plan terms via DocuSign by January 31, 2025.

### Failure to Acknowledge
Failure to acknowledge constitutes acceptance of plan terms. Participation in plan (accepting commission payments) constitutes binding acceptance.

### Questions
Contact Sales Compensation Team: salescomp@company.com`,
  },
];

/**
 * Get plan structure with governance gaps highlighted
 */
export function getPlanWithGaps(planCode: string): PlanSection[] {
  // For now, return the standard template
  // In the future, customize by planCode
  return COMPENSATION_PLAN_TEMPLATE;
}

/**
 * Get plan completion statistics
 */
export function getPlanCompletionStats() {
  const complete = COMPENSATION_PLAN_TEMPLATE.filter((s) => s.status === 'COMPLETE').length;
  const partial = COMPENSATION_PLAN_TEMPLATE.filter((s) => s.status === 'PARTIAL').length;
  const missing = COMPENSATION_PLAN_TEMPLATE.filter((s) => s.status === 'MISSING').length;
  const total = COMPENSATION_PLAN_TEMPLATE.length;

  return {
    complete,
    partial,
    missing,
    total,
    completeness: Math.round(((complete + partial * 0.5) / total) * 100),
  };
}
