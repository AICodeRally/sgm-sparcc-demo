/**
 * Plan Template Library
 * Industry best practice structure for compensation plans
 *
 * Best practice: Compensation mechanics first, governance policies at the end
 */

export interface TemplateSection {
  id: string;
  sectionNumber: string;
  title: string;
  category: 'PLAN_OVERVIEW' | 'PLAN_MEASURES' | 'PAYOUTS' | 'PAYOUT_EXAMPLE' | 'TERMS_CONDITIONS';
  order: number;
  isRequired: boolean;
  isSelectable: boolean; // Can client choose to include/exclude this section?
  description: string;
  defaultContent?: string;
}

/**
 * STANDARD COMPENSATION PLAN TEMPLATE
 * Industry best practice structure for well-organized compensation plans
 */
export const STANDARD_PLAN_TEMPLATE: TemplateSection[] = [
  // ===================
  // 1. PLAN OVERVIEW
  // ===================
  {
    id: 'section-01',
    sectionNumber: '1.0',
    title: 'Plan Overview',
    category: 'PLAN_OVERVIEW',
    order: 1,
    isRequired: true,
    isSelectable: false,
    description: 'Introduction, plan purpose, key highlights and updates',
    defaultContent: `# Sales Incentive Plan - [PLAN NAME]

## Plan Purpose
This plan provides the opportunity for participants to earn incentive compensation for achieving sales goals in an assigned geography.

## Key Highlights
- Annual target incentive: $[AMOUNT]
- Payment frequency: [Quarterly/Monthly]
- Performance threshold: [70%] of quota attainment

## How to Use This Document
This resource helps you understand how to leverage your plan to achieve your goals. Research shows that taking time to properly understand your plan provides a strong foundation for higher sales attainment.`,
  },

  {
    id: 'section-02',
    sectionNumber: '1.1',
    title: 'Sales Incentive Plan Summary',
    category: 'PLAN_OVERVIEW',
    order: 2,
    isRequired: true,
    isSelectable: false,
    description: 'Visual summary showing annual target breakdown and how incentives work',
    defaultContent: `## Sales Incentive Plan Summary

Your plan allows you to grow your earnings as you grow your business. This plan focuses on your business unit's critical strategic imperatives.

**Annual Target Incentive: $[TOTAL_AMOUNT]**

### Target Components:
- **Component A**: $[AMOUNT] ([XX]%) - [Description]
- **Component B**: $[AMOUNT] ([XX]%) - [Description]
- **Component C**: $[AMOUNT] ([XX]%) - [Description]

### How Payouts Work:
- **Quarterly Incentive Payouts**: Your incentives will be paid based on actual performance at quarter-end
- **Payment Timing**: Paid within 45 days of quarter close`,
  },

  // ===================
  // 2. PLAN MEASURES
  // ===================
  {
    id: 'section-10',
    sectionNumber: '2.0',
    title: 'Plan Measures',
    category: 'PLAN_MEASURES',
    order: 10,
    isRequired: true,
    isSelectable: false,
    description: 'Introduction to compensation components',
  },

  {
    id: 'section-11',
    sectionNumber: '2.1',
    title: 'Revenue Quota Bonus',
    category: 'PLAN_MEASURES',
    order: 11,
    isRequired: false,
    isSelectable: true,
    description: 'Earn bonus based on revenue quota attainment',
    defaultContent: `## Revenue Quota Bonus

Earn a bonus for your performance against your quarterly revenue quota for [PRODUCT LINE].

**Annual component target = $[AMOUNT]**

### How it works:
1. Start earning at 70% attainment
2. Earn an additional amount for each percent attainment over that, up to quota
3. The pay-per-percent rate increases over 90% attainment
4. When quarterly quota is achieved, you earn your quarterly target
5. Earn an additional payout for each percent attainment over quota

### Payout Table:
| Attainment | Quarterly Earnings |
|------------|-------------------|
| <70% | $0 |
| 70% | $[AMOUNT] |
| 71% - 89% | $[AMOUNT] plus $[X] per 1% over 70% |
| 90% - 99% | $[AMOUNT] plus $[X] per 1% over 90% |
| 100% | $[AMOUNT] |
| >100% | $[AMOUNT] plus $[X] per 1% over 100% |

**This measure is paid at quarter-end per the sales incentive calendar.**

*Quota varies by individual based on factors such as historical sales and potential.`,
  },

  {
    id: 'section-12',
    sectionNumber: '2.2',
    title: 'Unit Quota Bonus',
    category: 'PLAN_MEASURES',
    order: 12,
    isRequired: false,
    isSelectable: true,
    description: 'Earn bonus based on unit sales quota attainment',
    defaultContent: `## Unit Quota Bonus

Earn a bonus for your performance against your quarterly unit quota for [PRODUCTS].

**Annual component target = $[AMOUNT]**

### How it works:
[Similar structure to Revenue Quota Bonus]

### Payout Table:
[Attainment tiers and payouts]`,
  },

  {
    id: 'section-13',
    sectionNumber: '2.3',
    title: 'Strategic Product SPIF',
    category: 'PLAN_MEASURES',
    order: 13,
    isRequired: false,
    isSelectable: true,
    description: 'Incremental bonus for strategic product sales',
    defaultContent: `## Strategic Product SPIF

Earn a fixed bonus for every [PRODUCT] sale over baseline.

### How it works:
- Earn $[AMOUNT] for every [PRODUCT] sold over baseline ([X] units per quarter)
- Incremental to target incentives
- Paid quarterly

**Example:** If you sell 10 units and baseline is 4, you earn (10 - 4) x $[AMOUNT] = $[TOTAL]`,
  },

  {
    id: 'section-14',
    sectionNumber: '2.4',
    title: 'Coverage Bonus',
    category: 'PLAN_MEASURES',
    order: 14,
    isRequired: false,
    isSelectable: true,
    description: 'Bonus for covering vacant territories',
    defaultContent: `## Vacant Position Coverage Bonus

Opportunity to earn a bonus for covering eligible vacant territories.

### How it works:
When a vacancy arises, manager may designate one or more employees to cover the open role.

**Coverage Payment:** Up to $[AMOUNT] per week covered

### Eligibility Rules:
- Minimum of 4 weeks continuous coverage required
- Maximum of 10 weeks per coverage assignment
- Only vacancies from [ELIGIBLE ROLES] qualify
- Contractor coverage disqualifies the bonus

### Payment Rules:
- If multiple people share coverage, $[AMOUNT] is split among them
- No bonus for coverage less than 4 continuous weeks`,
  },

  // ===================
  // 3. PAYOUTS
  // ===================
  {
    id: 'section-20',
    sectionNumber: '3.0',
    title: 'Payouts',
    category: 'PAYOUTS',
    order: 20,
    isRequired: true,
    isSelectable: false,
    description: 'Payment timing and calendar',
  },

  {
    id: 'section-21',
    sectionNumber: '3.1',
    title: 'Payout Timing',
    category: 'PAYOUTS',
    order: 21,
    isRequired: true,
    isSelectable: false,
    description: 'When incentives are calculated and paid',
    defaultContent: `## Payout Timing

Calculations and payment of incentives, less any legally required or voluntary withholdings, are made as soon as relevant information and data is received and as soon as administratively possible after the last day of the fiscal period close.

**Typical timeline:** Within 45 days of quarter close

### Sales Incentive Calendar
[INSERT FISCAL CALENDAR WITH PAYOUT DATES]

### Payment Schedule:
- **Q1 Payout**: [DATE]
- **Q2 Payout**: [DATE]
- **Q3 Payout**: [DATE]
- **Q4 Payout**: [DATE]`,
  },

  // ===================
  // 4. PAYOUT EXAMPLE
  // ===================
  {
    id: 'section-30',
    sectionNumber: '4.0',
    title: 'Payout Example',
    category: 'PAYOUT_EXAMPLE',
    order: 30,
    isRequired: true,
    isSelectable: false,
    description: 'Worked example showing how incentives are calculated',
    defaultContent: `## Payout Example

**Illustrative purposes only**

### Quarterly Assumptions:
- Revenue Quota = 106% Attainment
- Unit Quota = 103% Attainment
- Strategic Product Sales = 10 units (baseline: 4)
- Coverage Weeks = 6 weeks (split with 1 other person)

### Calculation:

| Component | Calculation | Quarterly Earnings |
|-----------|-------------|-------------------|
| **Revenue Bonus** | (Payout at 100%) + (6% x $X per point) | $[AMOUNT] |
| **Unit Bonus** | (Payout at 100%) + (3% x $X per point) | $[AMOUNT] |
| **Strategic SPIF** | (10 - 4) x $[X] per unit | $[AMOUNT] |
| **Coverage Bonus** | (6 weeks x $[X]) ÷ 2 people | $[AMOUNT] |
| **TOTAL PAYOUT** | | **$[TOTAL]** |`,
  },

  // ===================
  // 5. TERMS & CONDITIONS
  // ===================
  {
    id: 'section-40',
    sectionNumber: '5.0',
    title: 'Terms and Conditions',
    category: 'TERMS_CONDITIONS',
    order: 40,
    isRequired: true,
    isSelectable: false,
    description: 'All governance policies and plan administration rules',
  },

  {
    id: 'section-41',
    sectionNumber: '5.1',
    title: 'Effective Dates of the Plan',
    category: 'TERMS_CONDITIONS',
    order: 41,
    isRequired: true,
    isSelectable: false,
    description: 'Plan effective period',
    defaultContent: `## 1. Effective Dates of the Plan

This Sales Incentive Plan is effective [START DATE] through [END DATE].

This Plan document supersedes all previous communications regarding the Plan, including but not limited to employment offer letters, memos, and verbal or written communications from managers.

The employment of a Plan Participant remains at-will (unless otherwise modified by a written term employment agreement).`,
  },

  {
    id: 'section-42',
    sectionNumber: '5.2',
    title: 'Compensation Plan Acknowledgement',
    category: 'TERMS_CONDITIONS',
    order: 42,
    isRequired: true,
    isSelectable: false,
    description: 'Participant responsibility to read and understand plan',
    defaultContent: `## 2. Compensation Plan Acknowledgement

It is the responsibility of every Participant to read, know, and understand all details of the Plan by which the Participant is compensated.

If applicable state law requires a Participant to acknowledge the Plan in writing, the Participant must have a signed copy of the most current Compensation Plan Acknowledgement on file to be eligible under this Plan.`,
  },

  {
    id: 'section-43',
    sectionNumber: '5.3',
    title: 'Eligibility',
    category: 'TERMS_CONDITIONS',
    order: 43,
    isRequired: true,
    isSelectable: true,
    description: 'Who is eligible to participate in the plan',
    defaultContent: `## 3. Eligibility

Eligibility in the Plan begins upon hire or transfer into a job covered by the Plan. An employee cannot participate in more than one Plan at the same time unless specified as part of the employee's compensation program.

A Participant is required to maintain satisfactory performance in all aspects of job duties throughout all fiscal quarters and the fiscal year. Unsatisfactory job performance or failure to abide by Company policies may disqualify a Participant from eligibility in the Plan or may result in reduced incentive.`,
  },

  {
    id: 'section-44',
    sectionNumber: '5.4',
    title: 'Plan Amendment or Termination',
    category: 'TERMS_CONDITIONS',
    order: 44,
    isRequired: true,
    isSelectable: false,
    description: 'Company right to amend or terminate plan',
    defaultContent: `## 4. Plan Amendment or Termination

This Plan may be amended, revised, changed, and/or terminated at any time by Company leadership at their sole judgment and discretion.

A Participant will be given reasonable notice before the Plan is changed or terminated, or quotas are changed. If any such change or plan termination is implemented, a Participant is eligible to earn commissions under the former Plan's terms on sales occurring prior to the effective date of the Plan's change or termination.

Minor adjustments and non-material changes, such as clarifications and corrections of typos, may be made at the sole judgment and discretion of the VP of Compensation.`,
  },

  {
    id: 'section-45',
    sectionNumber: '5.5',
    title: 'Plan Administration',
    category: 'TERMS_CONDITIONS',
    order: 45,
    isRequired: true,
    isSelectable: false,
    description: 'Timing, payment, revenue recognition, rounding rules',
    defaultContent: `## 5. Plan Administration

### a) Timing and Payment
All incentive payments will be earned and paid as defined by this Plan. Calculations and payment of incentives, less any legally required or voluntary withholdings, are made as soon as relevant information and data are received and as soon as administratively possible after the last day of the applicable incentive period.

### b) Revenue Recognition
Revenue performance is measured using Company's fiscal calendar. Incentives under this Plan are eligible to be earned only when the Company recognizes revenue, not when orders are received.

Discounts, credits, and allowances paid or given to customers are considered a reduction in revenue and will be deducted from the invoiced revenue for that account. Returned products, recalled products, rebates, administrative fees, and other required adjustments are also deducted.

### c) Rounding
- **Attainment calculations**: Rounded to the nearest whole percent
- **Payment calculations**: Rounded to the nearest whole dollar`,
  },

  {
    id: 'section-46',
    sectionNumber: '5.6',
    title: 'New Hires and Transfers',
    category: 'TERMS_CONDITIONS',
    order: 46,
    isRequired: true,
    isSelectable: true,
    description: 'How new hires and transfers are handled',
    defaultContent: `## 6. Plan Transitions

### a) New Hires
A new hire will be paid commissions on a pro-rated basis as of the hire date. A bonus will only be paid provided all eligibility requirements for the bonus have been met.

### b) Transfers Into the Plan
A transfer into the Plan will be paid commissions on a pro-rated basis as of the transfer date. If participation in another Plan continues past the point of transfer, participation in this Plan shall not begin until participation in all other Plans terminates.`,
  },

  {
    id: 'section-47',
    sectionNumber: '5.7',
    title: 'Termination, Retirement, Death, Disability',
    category: 'TERMS_CONDITIONS',
    order: 47,
    isRequired: true,
    isSelectable: true,
    description: 'Payment upon termination of employment',
    defaultContent: `## 7. Termination from the Plan

### a) Retirement
If a Participant retires prior to the last day of the fiscal quarter, the Participant will receive a pro-rated commission through the last day worked. A bonus will only be paid if all eligibility and earning requirements have been met.

### b) Death
If a Participant dies prior to the last day of the fiscal quarter, heirs or the Participant's estate will receive a pro-rated commission through the last day worked.

### c) Disability / Leave of Absence
If a Participant begins a continuous leave of absence prior to the last day of the fiscal quarter, the Participant will receive a pro-rated commission through the last day worked.

### d) Termination
If a Participant voluntarily or involuntarily leaves the Company prior to the last day of the fiscal quarter, the Participant will receive a pro-rated commission through the termination date. Participant is not eligible to receive any commissions calculated in future quarters.`,
  },

  {
    id: 'section-48',
    sectionNumber: '5.8',
    title: 'Quota Management',
    category: 'TERMS_CONDITIONS',
    order: 48,
    isRequired: false,
    isSelectable: true,
    description: 'How quotas are set and adjusted',
    defaultContent: `## 8. Quota Management

### Quota Setting
Individual quotas set annually by Sales Leadership in collaboration with Finance. Based on: territory potential, historical performance, market conditions, strategic priorities.

Quotas finalized and communicated by [DATE] for following calendar year.

### Mid-Year Quota Adjustments
Allowed only under these conditions:
- **Territory Change**: Quota adjusted proportional to accounts added/removed
- **Market Disruption**: Force majeure, natural disaster affecting >20% of territory
- **Product Discontinuation**: Quota reduced if product line representing >10% of quota is discontinued

All adjustments require SVP approval and written documentation. Maximum reduction: 20% without executive approval. No retroactive adjustments beyond current quarter.`,
  },

  {
    id: 'section-49',
    sectionNumber: '5.9',
    title: 'Territory Management',
    category: 'TERMS_CONDITIONS',
    order: 49,
    isRequired: false,
    isSelectable: true,
    description: 'Territory assignments and changes',
    defaultContent: `## 9. Territory Management

### Territory Assignment
Territories assigned by Sales Leadership and documented in CRM. Territory maps include geographic boundaries and assigned accounts.

### Territory Changes
Mid-year territory changes allowed only for business necessity (org restructure, acquisition, rep departure).

**During Transition:**
- 30-day advance notice when possible
- **Shadow Period**: 30 days where both old and new rep credited (50/50 split)
- **Pending Deals**: Assigned based on relationship ownership
- **Established Accounts**: New rep receives credit starting day 31

### Territory Mergers & Splits
- **Merger**: Rep with longer tenure receives combined territory
- **Split**: Accounts divided by geography and relationship
- **Grandfathered Commissions**: Old rep continues to receive commissions for up to 90 days on transferred accounts`,
  },

  {
    id: 'section-50',
    sectionNumber: '5.10',
    title: 'Sales Crediting',
    category: 'TERMS_CONDITIONS',
    order: 50,
    isRequired: false,
    isSelectable: true,
    description: 'How sales are credited and split credit scenarios',
    defaultContent: `## 10. Sales Crediting

### Standard Credit
Sales credited to assigned territory representative based on ship-to address or account assignment.

### Split Credit Scenarios
The following scenarios require documented split credit:

1. **Team Selling**: Written split agreement required BEFORE deal closes. Default split if no agreement: 50/50.

2. **Overlay Specialists**: Territory rep 70%, Specialist 30% (unless otherwise specified)

3. **Cross-Division Sales**: Division making primary sale 75%, Supporting division 25%

4. **House Accounts**: National accounts managed centrally receive 0% field credit. If field rep sources new location within house account: 50% credit for first year.

### Credit Disputes
- Rep must raise dispute within 30 days of transaction posting
- Manager reviews and makes initial determination within 10 business days
- Appeals to VP Sales within 5 business days
- VP decision is final and documented`,
  },

  {
    id: 'section-51',
    sectionNumber: '5.11',
    title: 'Windfall Protection',
    category: 'TERMS_CONDITIONS',
    order: 51,
    isRequired: false,
    isSelectable: true,
    description: 'Protection against windfall deals skewing compensation',
    defaultContent: `## 11. Windfall Protection

In the rare circumstance that a territory witnesses a "one-time" order of substantial value (a windfall opportunity), Company leadership reserves the right to enact the Windfall Protection clause.

This enables leadership to collect all, some, or none of the sales credit (and applicable compensation) while limiting the potential risk to the following year's sales base.

Each windfall situation is unique and will be handled individually at the sole discretion of Sales, Finance, and Compensation leadership.`,
  },

  {
    id: 'section-52',
    sectionNumber: '5.12',
    title: 'Clawback / Recovery',
    category: 'TERMS_CONDITIONS',
    order: 52,
    isRequired: false,
    isSelectable: true,
    description: 'When company can recover overpaid commissions',
    defaultContent: `## 12. Clawback / Recovery

### When Clawback Applies
Company may recover commissions in these situations:
1. **Customer Returns**: Product returned within 90 days of invoice
2. **Customer Non-Payment**: Invoice unpaid >120 days and written off
3. **Calculation Error**: Overpayment due to system or data error
4. **Fraud/Misrepresentation**: Rep provided false information affecting commission calculation

### Recovery Methods
1. **Offset Against Future Commissions**: Preferred method; spread over 3 months if amount >$5,000
2. **Payroll Deduction**: If no future commissions expected; subject to state wage law limits
3. **Direct Repayment**: If no longer employed; 30-day notice provided

### Recovery Limits
Maximum single-month deduction: 25% of gross commission payment (exceptions for fraud: no limit)`,
  },

  {
    id: 'section-53',
    sectionNumber: '5.13',
    title: 'Payment Timing & Compliance',
    category: 'TERMS_CONDITIONS',
    order: 53,
    isRequired: false,
    isSelectable: true,
    description: 'When commissions are paid and Section 409A compliance',
    defaultContent: `## 13. Payment Timing & Compliance

### Payment Frequency
Commissions calculated and paid **[quarterly/monthly]**. Payment occurs on the **[DATE]** following the period close.

**Example:** January sales invoiced → paid February [DATE]

### Payment Calculation Date
Commissions calculated based on **invoiced sales** (not booked orders). Invoice must be dated within the commission period to count toward that period.

### Section 409A Compliance
This plan is designed to comply with IRS Section 409A:
- All payments made within "short-term deferral" safe harbor (2.5 months after year-end)
- No discretion over payment timing once earned
- Termination payments follow plan terms without employer discretion`,
  },

  {
    id: 'section-54',
    sectionNumber: '5.14',
    title: 'Exceptions & Disputes',
    category: 'TERMS_CONDITIONS',
    order: 54,
    isRequired: false,
    isSelectable: true,
    description: 'How exceptions and disputes are handled',
    defaultContent: `## 14. Exceptions & Disputes

### Exception Requests
1. Submit written request to manager with business justification
2. Manager reviews and forwards with recommendation within 5 business days
3. **Approval Authority**:
   - Manager: Exceptions <$5,000
   - VP Sales: Exceptions $5,000-$25,000
   - Executive Committee: Exceptions >$25,000
4. Decision within 15 business days of request
5. All exceptions logged in compensation database

### Dispute Resolution
1. **Informal Resolution**: Discuss with manager within 30 days of statement
2. **Formal Dispute**: Submit written dispute to Compensation team within 45 days
3. **Investigation**: Compensation team investigates and responds within 15 business days
4. **Appeal**: Appeal to VP Sales within 10 business days if unresolved
5. **Final Decision**: VP Sales decision is final`,
  },

  {
    id: 'section-55',
    sectionNumber: '5.15',
    title: 'Leave of Absence',
    category: 'TERMS_CONDITIONS',
    order: 55,
    isRequired: false,
    isSelectable: true,
    description: 'Commission treatment during leave',
    defaultContent: `## 15. Leave of Absence

### Medical Leave (FMLA, Disability)
- **Short-Term (<30 days)**: Commissions continue on existing accounts
- **Long-Term (30+ days)**:
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
- Upon return: Full restoration of territory and quota`,
  },

  {
    id: 'section-56',
    sectionNumber: '5.16',
    title: 'Definitions',
    category: 'TERMS_CONDITIONS',
    order: 56,
    isRequired: true,
    isSelectable: false,
    description: 'Key terms defined',
    defaultContent: `## 16. Definitions

### a) Base Compensation
Base compensation is the portion of total compensation, typically referred to as salary, which Participants are paid on a bi-weekly basis.

### b) Incentive Plan
A variable pay plan designed to deliver compensation based on achievement against specific objectives.

### c) Target Incentive
The amount of incentive intended to be paid for achieving 100% of objectives. May be expressed as a dollar amount or a percent.

### d) Commission
Compensation based on the amount or value (net revenue generated) of the product sold. Commission payments are not conditioned on maintaining employment through the applicable period.

### e) Bonus
Compensation earned, in addition to salary or commissions, through meeting multiple factors besides the sale of a product. Bonuses may be conditioned on maintaining employment through the applicable period.

### f) Quota
The sales goal or target assigned to a Participant for a specific period.`,
  },
];

/**
 * Get template sections by category
 */
export function getSectionsByCategory(category: string): TemplateSection[] {
  return STANDARD_PLAN_TEMPLATE.filter((s) => s.category === category);
}

/**
 * Get all selectable sections (for template builder)
 */
export function getSelectableSections(): TemplateSection[] {
  return STANDARD_PLAN_TEMPLATE.filter((s) => s.isSelectable);
}

/**
 * Get required sections (always included)
 */
export function getRequiredSections(): TemplateSection[] {
  return STANDARD_PLAN_TEMPLATE.filter((s) => s.isRequired);
}
