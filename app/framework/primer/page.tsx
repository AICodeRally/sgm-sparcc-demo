'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  BookmarkIcon,
  RocketIcon,
  CheckCircledIcon,
  PersonIcon,
  BarChartIcon,
  LockClosedIcon,
  LightningBoltIcon,
  MixIcon,
  CalendarIcon,
  ArchiveIcon,
  GearIcon,
} from '@radix-ui/react-icons';
import { SetPageTitle } from '@/components/SetPageTitle';
import { renderTokenizedText } from '@/components/content/tokenUtils';

export default function GovernanceFrameworkPrimer() {
  const [selectedSection, setSelectedSection] = useState<string>('overview');

  const sections = [
    { id: 'overview', title: 'Framework Overview', icon: BookmarkIcon },
    { id: 'new-hire', title: 'New Hire & Ramp', icon: RocketIcon },
    { id: 'leave', title: 'Leave of Absence', icon: PersonIcon },
    { id: 'crediting', title: 'Sales Crediting', icon: CheckCircledIcon },
    { id: 'clawback', title: 'Clawbacks & Transitions', icon: ArchiveIcon },
    { id: 'windfall', title: 'Windfall Deals', icon: LightningBoltIcon },
    { id: 'spiff', title: 'SPIFFs', icon: MixIcon },
    { id: 'payment', title: 'Payment Timing', icon: CalendarIcon },
    { id: 'appeals', title: 'Appeals Process', icon: GearIcon },
  ];

  const content: Record<string, any> = {
    overview: {
      title: 'BHG SPM Governance Framework',
      subtitle: 'Comprehensive methodology for compensation governance',
      sections: [
        {
          heading: 'What is the BHG Governance Framework?',
          content: `The BHG Governance Framework is a proven methodology for designing, implementing, and managing sales compensation plans that are legally compliant, financially sound, and strategically aligned.

**12 Core Policy Areas**:
1. New Hire Guarantee & Ramp
2. Paid Leave of Absence & Open Territory Coverage
3. Leaves & Internal Transfers
4. Sales Crediting Rules
5. Clawbacks & Recovery
6. Account Transition Policy
7. Pay Mix Transition
8. Windfalls & Large Deals
9. SPIFFs & Contests
10. Payment Timing
11. Appeals/Exceptions Process
12. Governance Committee Structure

**Two-Phase Approach**:

**Phase 1: Consultant-Led Assessment**
- Assess existing plans against the framework
- Identify policy gaps and risks
- Deliver comprehensive gap analysis report
- Provide policy templates to fill gaps

**Phase 2: Client Self-Management**
- Customize framework for organization
- Implement ongoing compliance tracking
- Manage policy updates and changes
- Run quarterly governance reviews`,
        },
        {
          heading: 'Why Governance Matters',
          content: `**Without Proper Governance**:

❌ **Legal Risk**: Wage/hour violations, FLSA misclassification
❌ **Financial Risk**: 15-25% of comp budget lost to plan gaming and overpayments
❌ **Operational Risk**: Disputes consuming 20+ hours/week of management time
❌ **Strategic Risk**: Wrong behaviors incentivized, poor customer experience
❌ **Equity Risk**: Inconsistent treatment across reps, perceived unfairness

**With BHG Framework**:

[OK] **Legal Compliance**: Policy templates ensure FLSA and state law adherence
[OK] **Cost Control**: Clear rules prevent gaming and overpayment
[OK] **Reduced Disputes**: 70% reduction in escalations with clear policies
[OK] **Strategic Alignment**: Behaviors aligned with business objectives
[OK] **Fair Treatment**: Consistent application of rules across organization`,
        },
      ],
    },
    'new-hire': {
      title: 'New Hire Guarantee & Ramp',
      subtitle: 'Providing cash flow while new hires learn and ramp',
      sections: [
        {
          heading: 'Guiding Principles',
          content: `**Provide new hires cash flow while they learn/ramp**
- Balance investment in new hires with associated costs
- Consistent policy (minimize mgmt. judgement and exceptions) to ensure equal treatment
- Reduce administrative complexity
- Keep it simple

**Key Philosophy**:
Sales comp plan should not be a distraction for new hires. If they are worried about survival in the first year, focus should be on onboarding program that provides tools, messages and resources to be successful.

[WARN] **Warning**: If Reps do not see a path to success in the first year, and are not adequately paid during ramp period (no draw or unattainable quota), they will leave.`,
        },
        {
          heading: 'Key Considerations',
          content: `**Length of Time to Ramp**:
- How long does it take a new hire to become productive?
- Different for green field territories vs. mature territories

**Pay Philosophy**:
- If TTC is set at 75th percentile of market, don't need to pay 100% of TI during ramp
- Pay mix matters: 80/20 roles may not need a draw

**Sales Cycle Complexity**:
- Is the sales cycle long and complex? (can it be shortened?)
- Are territories bad / best accounts taken? (re-allocate territories)
- Do they have enough qualified leads? (revisit lead generation)
- Are new Reps adequately equipped with tools, messages, resources?

**Remember**: TI is pay-at-risk for achieving a quota. Company owes Rep their TI if cannot accurately measure their performance.`,
        },
        {
          heading: 'Market Practices (AGI 2016)',
          content: `**Immediate Plan Placement**:
[CHART] Almost **half of companies** immediately place new hire on the plan
[CHART] More than **half of companies** allow new hires to be eligible for incentive payment

**Draw/Guarantee Duration**:
[CHART] **36%** of companies have 2-3 month draws or guarantees
[CHART] **28%** provide target incentive as a draw or guarantee for new hires

**Quota Approach**:
[CHART] **51%** provide either full or partial quotas to new hires

**Common Options**:
1. **Full Quota + Draw** - Provide 3-6 month draw/guarantee, full quota from day 1
2. **Ramped Quota** - Start at 25-50% quota in month 1, ramp to 100% by month 6-12
3. **Guarantee Only** - Pay 100% of TI for first 3-6 months, no quota
4. **Hybrid** - Guarantee for 90 days, then ramped quota`,
        },
      ],
    },
    leave: {
      title: 'Leave of Absence & Open Territory Coverage',
      subtitle: 'Compensation during LOA and coverage assignments',
      sections: [
        {
          heading: 'Guiding Principles - Leave of Absence',
          content: `**Core Principles**:
[OK] **Align to HR reward philosophies and benefit policies**
[OK] **Pay for persuasion** - only pay for work actually performed
[OK] **Be fair** - consistent treatment across situations
[OK] **Keep it simple** - minimize administrative burden

**Key Considerations**:

**Insurance Benefits**: If company pays 100% of target incentive through insurance, may not need additional policies

**Performance Period**: If shorter (quarterly vs annual), easier to close out plan and start new one upon return

**Crediting Rules**: If pay on invoice, consider final payment on bookings before leave

**Account Coverage**: If another Rep covers territory, consider split credits

**LOA Duration**:
- Short leave (< 30 days) → temporary coverage with credit split
- Long leave (> 90 days) → close out plan, reassign territory

**Use of Quotas**: No need to adjust if role doesn't have quota`,
        },
        {
          heading: 'Policy Options',
          content: `**Option 1: Close Out Plan (Start New Plan Upon Return)**

**Decision 1 - Final Payment Upon Leave**:
- Sales completed until last day
- Sales completed past last day (move up crediting rule)

**Decision 2 - Target Incentive While On Leave**:
- Insurance benefits only (100% of base salary)
- Additional incentive guarantee (100% or less)
- Additional incentive guarantee based on historical earnings

**Decision 3 - Credit for Coverage Rep**:
- 100% credit (if taking over permanently)
- Partial/Split credit (if temporary)
- No credit (if minimal work required)

---

**Option 2: Keep Plan Open**

**Decision 1 - Target Incentive**:
- No change
- Prorate based on time away

**Decision 2 - Quota**:
- No change / No quota
- Prorate based on time away

**Decision 3 - Credit**:
- No change
- Prorate based on time away`,
        },
        {
          heading: 'Market Practices - Leave of Absence (AGI 2016)',
          content: `**Incentive Payment During LOA**:
[CHART] **50%** of companies do NOT guarantee incentive payments during paid leave of absence

**Sales Credit Past Leave Date**:
[CHART] **42%** of companies do NOT provide additional sales credit for sales closed past leave of absence date

**Quota Adjustment**:
[CHART] **46.3%** (majority) make NO quota adjustment for those going on paid leave of absence

**Open Territory Coverage**:
[CHART] **25%** of companies give sellers full credit WITHOUT quota adjustment for temporarily assigned accounts from open territories

**BHG Recommendation**:
⭐ **Close out plan** for leaves > 90 days
⭐ **Prorate quota** based on time away for leaves < 90 days
⭐ **Split credit 50/50** for temporary coverage assignments`,
        },
        {
          heading: 'Guiding Principles - Open Territory Coverage',
          content: `**Manager Accountability**:
Hold manager responsible for filling the position as quickly as possible – keep assignment at Manager and/or open territory assignments time bound

**Determine Coverage Needs**:
- Does entire territory need coverage?
- Only specific accounts?
- Only specific active deals?

**Recognize Extra Work**:
When assigned to open territories/accounts/deals, recognize Reps for the overtime work associated with it

**Don't Overpay**:
Ensure Reps are mainly paid for their primary job by using:
- Modified credits/commission rates, OR
- Add-on bonuses (not full credit on top of regular territory)

**Common Approach**:
- **Key accounts only**: Manager or senior rep covers strategically
- **50% credit**: Covering rep gets 50% credit, no quota adjustment
- **Time limit**: Coverage assignments expire after 90 days (forces hiring decision)`,
        },
      ],
    },
    crediting: {
      title: 'Sales Crediting Rules',
      subtitle: 'When and how sales are credited for incentive payment',
      sections: [
        {
          heading: 'Guiding Principles - Pay for Persuasion',
          content: `**Core Principle**: Link pay to the desired events and outcomes needed

**Five Guiding Principles**:

1️⃣ **Pay for Persuasion**
Link pay to the actions that influence the sale

2️⃣ **Pay Only When Performing the Job Function**
No credit if someone else is doing the work

3️⃣ **Pay Only for a Fixed Period of Time**
Credit windows prevent perpetual claims on accounts

4️⃣ **Pay According to Business Strategy**
Align crediting with strategic objectives (new logo, expansion, retention)

5️⃣ **Link to Desired Events and Outcomes**
Credit when the right activities occur, not just luck`,
        },
        {
          heading: 'Key Considerations',
          content: `**Probability of De-bookings and Bad Debt**:
- High cancellation rate → consider payment on revenue vs booking
- Low churn → payment at booking is safer

**Time Lag Between Events**:
- Booking → Revenue → Cash Collection
- Longer lag increases risk of overpayment

**Alignment with Revenue Recognition (GAAP)**:
- Compensation plans can use different "sales crediting event" than GAAP revenue recognition
- Most effective when revenue can be fully recognized when order is placed
- If complex revenue recognition rules, consider payment at booking but with extended clawback

**Alignment with Other Roles**:
- Sales management crediting
- Sales engineers, pre-sales, post-sales
- Customer success teams
- Channel partners`,
        },
        {
          heading: 'Sales Crediting Event Options',
          content: `**Timing Options** (when does credit occur?):

1️⃣ **Booking/Order Placed**
[OK] Fastest payment (motivational)
[WARN] Risk if high cancellation rate
[NOTE] **Use Case**: Low churn SaaS, enterprise deals, long sales cycles

2️⃣ **Revenue Recognition**
[OK] Zero revenue risk
[WARN] Delayed payment (may reduce motivation)
[NOTE] **Use Case**: Complex contracts, usage-based, multi-year deals

3️⃣ **Invoice Sent**
[OK] Balance between speed and risk
[WARN] Still risk of non-payment
[NOTE] **Use Case**: Standard billing cycles, predictable collection

4️⃣ **Cash Collected**
[OK] Zero financial risk
[WARN] Very delayed payment
[NOTE] **Use Case**: High default risk industries, new customers

5️⃣ **Hybrid** (e.g., 50% at booking, 50% at revenue)
[OK] Balances motivation and risk
[WARN] More complex to administer
[NOTE] **Use Case**: Strategic new products, uncertain revenue timing`,
        },
        {
          heading: 'Global & Cross-Region Crediting',
          content: `**Objective**: Increase revenue by incenting more cross-region business, while keeping costs in control

**Global Accounts**:
[COST] **Double credit/Double compensation** to encourage and reward Global Account Manager (GAM) to work in collaboration with regional resources
[CHART] Must develop an ROI for deploying more costly overlay structure

**Cross-Region Accounts**:

**Best Practice 1**: Use pre-defined split crediting rules based on influence
- Table with associated activities and split rules (vary by industry)
- Example: Lead-generating rep gets 25%, closing rep gets 75%

**Best Practice 2**: Provide 125%-150% total credit for cross-border deals
- Reps tend not to focus on 50% credit deals
- But 75% credit gets their attention
- Total cost: 125-150% of standard commission (shared between 2+ reps)

**Best Practice 3**: Ensure revenue recognition rules align with cross-border objectives
- Compensation credit rules alone are not enough
- Regional finance and management must also focus on it
- Revenue must "count" for both regions in planning`,
        },
        {
          heading: 'Split Crediting Best Practices',
          content: `**Good Practices**:
[OK] Pre-defined split rules based on role/activity
[OK] Clear definitions of "influence" vs "closing"
[OK] Time-bound credit windows (e.g., 90 days)
[OK] Documented in CRM (who influenced the deal)
[OK] Escalation process for disputes

**Poor Practices**:
❌ Manager discretion on every deal (inconsistent)
❌ Equal split regardless of contribution
❌ No time limit on influence claims
❌ Verbal agreements only
❌ Retroactive split decisions

**Common Split Credit Scenarios**:

**Scenario 1: Lead Generation + Closing**
- SDR/BDR generates qualified lead: **25%**
- AE closes deal: **75%**

**Scenario 2: Territory Transition**
- Outgoing rep (if > 50% work done): **50-75%**
- Incoming rep: **25-50%**

**Scenario 3: Sales Engineer Support**
- AE: **85-100%** (full credit)
- SE: **Bonus or MBO** (not commission)

**Scenario 4: Multi-Product**
- Product A specialist: **Credit for Product A revenue only**
- Product B specialist: **Credit for Product B revenue only**
- Both get credit, but on different revenue components`,
        },
      ],
    },
    clawback: {
      title: 'Clawbacks & Account Transitions',
      subtitle: 'Recovering commissions and handling territory changes',
      sections: [
        {
          heading: 'Clawback Policy',
          content: `**What is a Clawback?**
Recovery of commission previously paid when the underlying sale is cancelled, modified, or returned.

**When Clawbacks Apply**:
[OK] Customer cancels within clawback period (typically 90-180 days)
[OK] Deal size reduced (downsell, renegotiation)
[OK] Product returned
[OK] Customer fails to pay (bad debt)
[OK] Fraud or misrepresentation

**Clawback Period Duration**:

**Short (30-60 days)**:
- Low-risk products
- Established customers
- Non-refundable commitments

**Medium (90-120 days)**:
- Standard SaaS contracts
- New customers
- Monthly billing

**Long (180-365 days)**:
- Complex implementations
- High churn risk
- Usage-based billing

**Best Practice**: 120-day clawback for booking-based payment

**No Clawback**: Only if payment is at revenue recognition or cash collection`,
        },
        {
          heading: 'Clawback Mechanics',
          content: `**Recovery Methods**:

1️⃣ **Offset Against Future Commissions** (Most Common)
[OK] Deduct from next commission payment
[OK] No impact to base salary (legally safer)
[WARN] May take multiple periods if large clawback

2️⃣ **Separate Repayment Agreement**
[OK] Rep signs agreement to repay over time
[OK] Used for large clawbacks or terminated reps
[WARN] Requires separate legal agreement

3️⃣ **Draw Offset** (If Applicable)
[OK] Reduce outstanding draw balance
[WARN] Only works if rep has draw in place

**State Law Considerations**:

[WARN] **California**: Cannot deduct from wages (base salary)
- Must use "prospective offset" against future commissions
- Separate repayment agreement if no future commissions

[WARN] **New York**: Similar restrictions
- Written authorization required
- Cannot reduce below minimum wage

**What NOT to Do**:
❌ Deduct from base salary/wages
❌ Withhold final paycheck for clawback
❌ Retroactive clawback policy (must be in writing before sale)`,
        },
        {
          heading: 'Account Transition Policy',
          content: `**When Transitions Occur**:
- Rep changes territories or roles
- Account moves from one territory to another
- Territory realignment
- Rep termination

**Guiding Principles**:

**Management Determines Transition Credit**:
Division Sales VP must approve account transitions and determine credit split based on:
- Who did the work to develop the account?
- Who maintains the relationship?
- What's the status of active opportunities?

**Timing Matters**:
Transitions should occur preferably prior to the beginning of new quarter (clean break)

**Active Opportunities Require Split Credit**:
For specific active opportunities, authorize a credit split during transition to reward appropriate efforts by each participant

**Credit Split Guidelines**:
Split aligns with amount of effort involved in closing the deal once identified:

- **0-25% complete**: New rep gets **100%** (old rep did discovery only)
- **25-50% complete**: Split **50/50** (shared effort)
- **50-75% complete**: Old rep gets **75%**, new rep **25%** (mostly done)
- **75-100% complete**: Old rep gets **100%** (just needs signature)

**Documentation Required**:
Submit account changes to Sales Operations for quota adjustment`,
        },
        {
          heading: 'Pay Mix Transition',
          content: `**Scenario**: Transitioning a rep to MORE aggressive pay mix (e.g., 80/20 → 70/30)

**Options**:

**Option 1: Immediate Transition**
- Switch to new pay mix on effective date
- [OK] Simple, clean
- [WARN] Rep experiences immediate pay decrease (unless quota adjusts)

**Option 2: Graduated Transition**
- Year 1: 80/20 → 75/25
- Year 2: 75/25 → 70/30
- [OK] Softer landing for rep
- [WARN] More complex to administer

**Option 3: Grandfather Period**
- Keep rep on old plan for 12 months
- Switch to new plan after grace period
- [OK] Protects high performers
- [WARN] Creates internal equity issues

**Option 4: Transition Bonus**
- Pay one-time bonus to offset pay mix change
- Example: 6 months of variable pay difference
- [OK] Recognizes historical performance
- [WARN] One-time cost

**BHG Recommendation**:
⭐ **Immediate transition** with clear communication
⭐ **Adjust quotas** to maintain earnings opportunity
⭐ **One-time bonus** only for top performers at risk of leaving`,
        },
      ],
    },
    windfall: {
      title: 'Windfall & Large Deal Policy',
      subtitle: 'Managing unusually large, unforecasted commissions',
      sections: [
        {
          heading: 'What is a Windfall Deal?',
          content: `**Definition**:
An unusually large commission that:
- Was not forecasted or planned
- Significantly exceeds normal deal size
- May result from luck, timing, or minimal effort relative to payout
- Creates unintended compensation cost

**Why Windfall Policies Matter**:

❌ **Without Policy**:
- Rep earns 300-500% of target compensation from single deal
- Creates internal equity issues (other reps feel unfair)
- Budget overruns
- Sets unsustainable precedent

[OK] **With Policy**:
- Predictable compensation costs
- Fair treatment across reps
- Maintains motivation for normal-sized deals
- Clear escalation and review process`,
        },
        {
          heading: 'Windfall Policy Components',
          content: `**1. Definition of "Windfall"**
Quantify what constitutes a windfall:
- Deal size > $X (e.g., $5M+)
- Commission > $Y (e.g., $500K+)
- Commission > Z% of annual target (e.g., 200%+)

**2. Review & Approval Process**
Trigger for large deals:
- Notify management when threshold hit
- Sales VP reviews deal circumstances
- Comp Review Board (CRB) makes final decision

**3. Treatment Options** (CRB decides):

**Option A: Pay Full Commission** (deal was earned)
- Rep did significant work
- Strategic account win
- Competitive situation

**Option B: Cap Commission**
- Pay up to $X maximum
- Example: Cap at 250% of annual target comp

**Option C: Amortize Payment**
- Pay commission over 2-3 years
- Incentivizes rep retention
- Reduces single-period cost

**Option D: Split Credit**
- Credit multiple contributors
- Overlay support, executives, etc.

**Option E: Convert to Bonus**
- Pay portion as discretionary bonus
- Not subject to standard commission rate

**Option F: Deny/Reduce**
- Deal was pure luck or account of record
- Minimal rep involvement

**4. Documentation**
- CRB meeting minutes
- Decision rationale
- Notification to rep`,
        },
        {
          heading: 'Example Windfall Scenarios',
          content: `**Scenario 1: Enterprise Expansion**
- **Situation**: Existing customer adds $10M in new products (3x normal deal size)
- **Rep Argument**: "I cultivated this relationship for 3 years"
- **CRB Decision**: Pay 100% commission - strategic expansion, rep drove it
- **Action**: Approve full payout

---

**Scenario 2: Merger/Acquisition**
- **Situation**: Customer acquires another company, inherits their licenses → $8M add-on
- **Rep Argument**: "It's my account, I should get credit"
- **CRB Decision**: Pure luck, minimal rep involvement
- **Action**: Pay 25% of commission or fixed bonus

---

**Scenario 3: RFP Win**
- **Situation**: Won 5-year, $15M contract via RFP against 3 competitors
- **Rep Argument**: "I led the RFP response, worked 6 months on this"
- **CRB Decision**: Strategic win, significant effort
- **Action**: Pay 100% but amortize over 3 years (retention)

---

**Scenario 4: Executive Relationship**
- **Situation**: CEO relationship led to $12M deal, rep minimally involved
- **Rep Argument**: "I was the point of contact"
- **CRB Decision**: Executive relationship was primary driver
- **Action**: Split credit - 50% to rep, 50% to executives involved`,
        },
        {
          heading: 'Best Practices',
          content: `[OK] **Document Policy in Plan**
Include windfall policy in every compensation plan document

[OK] **Define Thresholds Clearly**
Use specific dollar amounts or percentages, not "unusual" or "large"

[OK] **Establish Comp Review Board (CRB)**
- 3-5 members (Sales VP, CFO, HR, Legal)
- Quarterly meeting cadence
- Clear charter and decision authority

[OK] **Review Process Transparency**
- Notify rep when deal enters review
- Provide opportunity for rep to present case
- Document decision rationale

[OK] **Timely Decisions**
- Make decision within 30 days of deal close
- Don't leave reps hanging for months

[OK] **Consistent Application**
- Apply same criteria to all reps
- Avoid favoritism or special treatment

**Common Threshold**:
[TARGET] Deals > $5M OR Commissions > 200% of annual target → automatic CRB review`,
        },
      ],
    },
    spiff: {
      title: 'SPIFFs & Contests',
      subtitle: 'Short-term incentives to drive specific behaviors',
      sections: [
        {
          heading: 'SPIFF Concepts',
          content: `**What is a SPIFF?**
Sales Performance Incentive Fund - Add-on rewards to drive short-term goals

**Purpose**:
- Drive specific short-term objectives
- Generate excitement and motivation
- Build competitive sales culture
- Provide additional compensation opportunity

[WARN] **Critical**: Should NOT undermine the sales compensation plan

**Requirements**:
[OK] Clear objective and defined ROI
[OK] Time-limited (3-6 months maximum)
[OK] Unpredictable timing (not every quarter)`,
        },
        {
          heading: 'SPIFF Design Principles',
          content: `**1. OVERVIEW - Motivate, Build Culture, Generate Excitement**
- Focus on specific business objective
- Create competitive energy
- NOT a substitute for compensation plan

**2. ELIGIBILITY - Clear Criteria, Equal Opportunity**
[OK] Use clear eligibility and qualification criteria
[OK] Provide equal opportunity to achieve
❌ No random selection of winners
❌ No "insider advantages"

**3. REWARDS & PAYOUTS - Cash, Travel, or Merchandise**
[COST] Budget ~3% of TTC (Total Target Cash)
[COST] Max 20% of TI (Target Incentive) payouts for each award
[TARGET] Target at least 30% participation
❌ No de-motivating "winner-take-all" contests

**4. DURATION & FREQUENCY - Time-Limited, Unpredictable**
⏱️ Use 3 or less per year
⏱️ Limit duration to 3-6 months
⏱️ Ensure they are unpredictable (different times of year)

**5. MEASURES - Track, Report, Audit**
[CHART] Able to track, report and audit systematically
❌ Do NOT use measures already in the sales compensation plan
[OK] Can be completed within period - pay for effort, not coincidences`,
        },
        {
          heading: 'SPIFF Examples',
          content: `**Good SPIFF Examples**:

[OK] **New Product Launch**
- **Objective**: Drive 100 deals of new Product X in 90 days
- **Reward**: $500 per deal (in addition to normal commission)
- **Why Good**: Clear measure, time-limited, strategic objective

[OK] **Territory Expansion**
- **Objective**: First 5 deals in new geographic region
- **Reward**: $1,000 per deal + trip to President's Club
- **Why Good**: Drives strategic expansion, limited duration

[OK] **Pipeline Build**
- **Objective**: 20 qualified demos scheduled in Q1
- **Reward**: $100 per demo (capped at 20)
- **Why Good**: Measures activity, not in main plan, achievable

**Bad SPIFF Examples**:

❌ **Revenue Accelerator**
- **Problem**: Paying extra for revenue already in main plan
- **Why Bad**: Undermines main plan, creates expectation

❌ **Winner-Take-All Contest**
- **Problem**: Only top 3 reps win, others get nothing
- **Why Bad**: Demotivates 90% of team

❌ **Year-Long SPIFF**
- **Problem**: 12-month duration
- **Why Bad**: Not short-term, becomes expected

❌ **Discretionary Award**
- **Problem**: No clear criteria, manager picks winners
- **Why Bad**: Perceived as unfair, inconsistent`,
        },
      ],
    },
    payment: {
      title: 'Payment Timing',
      subtitle: 'When commissions are calculated and paid',
      sections: [
        {
          heading: 'Market Practices (AGI 2016)',
          content: `**Industry Standard**:

[CHART] **Timing Philosophy**:
"The sooner the incentive payout is made after the close of the measurement incentive period, the better"

[CHART] **Most Common Practice**:
Most companies payout between **30-45 days** after the close of the measurement period

**Why 30-45 Days?**
- Time to validate deals (bookings confirmed)
- Time to process payroll
- Time to resolve disputes
- Balance between speed and accuracy`,
        },
        {
          heading: 'Payment Timing Options',
          content: `**Option 1: 30 Days After Period End** (Most Common)
- Deals close → validation → payment within 30 days
- [OK] Fast payout (motivational)
- [OK] Minimal disruption to cash flow
- [WARN] Less time for validation

**Option 2: 45 Days After Period End**
- More time for deal validation
- [OK] Higher accuracy
- [OK] More time to resolve disputes
- [WARN] Slightly delayed gratification

**Option 3: 60+ Days After Period End**
- Used for complex revenue recognition
- [OK] Highest accuracy
- [WARN] Significant delay reduces motivation

**Option 4: Monthly Payments (for Quarterly Plans)**
- Pay partial commission monthly based on estimated attainment
- True-up at end of quarter
- [OK] Provides regular cash flow
- [WARN] More complex to administer`,
        },
        {
          heading: 'Best Practices',
          content: `[OK] **Consistency is Key**
Pay on same schedule every period (builds trust)

[OK] **Communicate Timeline**
Tell reps exactly when to expect payment

[OK] **Provide Visibility**
Show commission statements before payment date

[OK] **Balance Speed and Accuracy**
Don't sacrifice validation for speed

[OK] **Document Exceptions**
If payment is late, communicate why

**Typical Timeline**:

**Day 1-5**: Period ends, deals finalized
**Day 6-15**: Validation, dispute resolution
**Day 16-25**: Commission calculations, approvals
**Day 26-30**: Payroll processing, payment issued

**Red Flags**:
❌ Payment timing varies month-to-month
❌ Reps don't know when to expect payment
❌ No commission statement provided
❌ Frequent "late" payments without explanation`,
        },
      ],
    },
    appeals: {
      title: 'Appeals & Exceptions Process',
      subtitle: 'Resolving compensation disputes and handling exceptions',
      sections: [
        {
          heading: 'Why an Appeals Process Matters',
          content: `**Without Formal Process**:
❌ Inconsistent decisions (favoritism)
❌ Manager overload (ad-hoc decisions on every issue)
❌ Reps lose trust in system
❌ Legal risk (wage/hour claims)

**With Formal Process**:
[OK] Consistent, fair treatment
[OK] Clear escalation path
[OK] Documented decisions (audit trail)
[OK] Reduced management burden
[OK] Increased rep trust`,
        },
        {
          heading: 'Comp Review Board (CRB) Structure',
          content: `**Purpose**:
Centralized governance body to review and approve compensation exceptions, disputes, and windfall deals

**Typical Members**:
1. **Sales VP** (Chair) - Business perspective
2. **CFO or Finance VP** - Financial impact
3. **HR VP** - Policy compliance, equity
4. **Legal Counsel** - Regulatory compliance
5. **Sales Operations** (Ex-officio) - Data, analysis

**Meeting Cadence**:
- **Regular**: Quarterly (standard reviews)
- **Ad-hoc**: As needed for urgent issues
- **Annual**: Policy review and updates

**Decision Authority**:
- Approve/deny exception requests
- Modify windfall deal payouts
- Interpret plan language
- Update policy guidance

**Documentation Requirements**:
- Meeting minutes
- Decision rationale
- Rep notification`,
        },
        {
          heading: 'Example Escalation Process',
          content: `**Level 1: Manager** (Resolve within 5 business days)
- Rep submits dispute to direct manager
- Manager reviews and makes decision
- Example: Credit correction, simple split credit

**Level 2: Sales Operations** (Resolve within 10 business days)
- Manager escalates to Sales Ops if cannot resolve
- Sales Ops reviews plan language and precedent
- Example: Complex credit scenario, system error

**Level 3: Sales VP** (Resolve within 15 business days)
- Sales Ops escalates if policy interpretation needed
- VP makes decision or escalates to CRB
- Example: Large payout, policy gap

**Level 4: Comp Review Board** (Resolve within 30 business days)
- CRB reviews at next meeting
- Final decision (binding)
- Example: Windfall deal, major exception

**Expedited Review**:
- For time-sensitive issues (e.g., rep termination)
- Emergency CRB meeting within 5 days`,
        },
        {
          heading: 'Common Appeal Scenarios',
          content: `**Scenario 1: Credit Dispute**
- **Issue**: Two reps claim credit for same deal
- **Resolution Path**: Manager → Sales Ops (review CRM activity)
- **Typical Outcome**: Split credit based on documented influence

**Scenario 2: Quota Relief Request**
- **Issue**: Rep requests quota reduction due to territory quality
- **Resolution Path**: Manager → Sales VP → CRB (if large adjustment)
- **Typical Outcome**: Deny (quota is quota), but may offer transition period

**Scenario 3: Calculation Error**
- **Issue**: Commission statement shows incorrect amount
- **Resolution Path**: Manager → Sales Ops (verify calculation)
- **Typical Outcome**: Correct on next payment, with back-pay if needed

**Scenario 4: Policy Interpretation**
- **Issue**: Plan language is ambiguous
- **Resolution Path**: Sales Ops → Sales VP → CRB
- **Typical Outcome**: CRB interprets, updates policy guidance for future

**Scenario 5: Hardship Exception**
- **Issue**: Rep requests draw extension due to personal situation
- **Resolution Path**: Manager → HR → CRB
- **Typical Outcome**: Case-by-case, typically deny to maintain equity`,
        },
        {
          heading: 'Appeals Process Template',
          content: `**Step 1: Rep Submits Appeal**
- Use standard form (email or system)
- Include: Issue description, supporting evidence, desired outcome
- Submit to direct manager

**Step 2: Manager Review (5 days)**
- Review facts and plan language
- Consult with Sales Ops if needed
- Make decision or escalate

**Step 3: Sales Ops Review (10 days)**
- Verify calculations and data
- Review precedent and policy
- Recommend decision or escalate

**Step 4: CRB Review (30 days)**
- Quarterly meeting review
- Rep may present case
- CRB makes final decision

**Step 5: Decision Communication**
- Written notification to rep
- Explanation of rationale
- Effective date of any adjustment

**Step 6: Documentation**
- Log in appeals tracking system
- Update policy guidance if needed
- Record for audit trail`,
        },
      ],
    },
  };

  const currentContent = content[selectedSection];

  return (
    <>
      <SetPageTitle
        title="Framework Primer"
        description="Educational guide to BHG governance methodology and best practices"
      />
      <div className="h-screen flex flex-col sparcc-hero-bg">
        {/* Header */}
        <div className="bg-[color:var(--surface-glass)] backdrop-blur-sm border-b border-[color:var(--color-border)] px-8 py-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-4 mb-4">
              <Link
                href="/framework"
                className="text-[color:var(--color-primary)] hover:text-[color:var(--color-primary)] transition-colors"
              >
                ← Back to Framework
              </Link>
            </div>
            <h1 className="text-3xl font-bold bg-[linear-gradient(90deg,var(--sparcc-gradient-start),var(--sparcc-gradient-mid2),var(--sparcc-gradient-end))] bg-clip-text text-transparent">
              BHG Governance Framework Primer
            </h1>
            <p className="text-[color:var(--color-muted)] mt-2">
              Learn SPM best practices for compensation governance - sourced from BHG consulting methodology
            </p>
          </div>
        </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Navigation */}
        <div className="w-80 border-r border-[color:var(--color-border)] bg-[color:var(--surface-glass)] backdrop-blur-sm overflow-y-auto">
          <div className="p-4">
            <h3 className="text-sm font-semibold text-[color:var(--color-muted)] uppercase mb-3">Policy Areas</h3>
            <div className="space-y-1">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setSelectedSection(section.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all flex items-center gap-3 ${
                      selectedSection === section.id
                        ? 'bg-[linear-gradient(90deg,var(--sparcc-gradient-start),var(--sparcc-gradient-mid2),var(--sparcc-gradient-end))] text-white shadow-md'
                        : 'hover:bg-[color:var(--color-surface-alt)] text-[color:var(--color-foreground)]'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium text-sm">{section.title}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-[color:var(--color-surface)] rounded-xl shadow-lg p-8 mb-6">
              <h2 className="text-3xl font-bold text-[color:var(--color-foreground)] mb-2">
                {currentContent.title}
              </h2>
              <p className="text-[color:var(--color-muted)]">{currentContent.subtitle}</p>
            </div>

            {currentContent.sections.map((section: any, idx: number) => (
              <div key={idx} className="bg-[color:var(--color-surface)] rounded-xl shadow-lg p-8 mb-6">
                <h3 className="text-2xl font-bold text-[color:var(--color-foreground)] mb-4">
                  {section.heading}
                </h3>
                <div className="prose prose-lg max-w-none">
                  {section.content.split('\n\n').map((paragraph: string, pIdx: number) => {
                    // Render formatted content
                    if (paragraph.startsWith('**') && paragraph.includes('**:')) {
                      const title = paragraph.split('**:')[0].replace(/\*\*/g, '');
                      const content = paragraph.split('**:')[1];
                      return (
                        <div key={pIdx} className="mb-4">
                          <h4 className="text-lg font-bold text-[color:var(--color-foreground)] mb-2">{title}</h4>
                          {content && (
                            <p className="text-[color:var(--color-foreground)]">{renderTokenizedText(content)}</p>
                          )}
                        </div>
                      );
                    }

                    // Regular paragraph with inline formatting
                    return (
                      <p
                        key={pIdx}
                        className="text-[color:var(--color-foreground)] leading-relaxed mb-4 whitespace-pre-line"
                      >
                        {renderTokenizedText(paragraph)}
                      </p>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      </div>
    </>
  );
}
