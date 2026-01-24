# SGM-SPARCC Demo Script

> **For:** Presenters demonstrating SGM to prospects and stakeholders
> **Duration:** 15-20 minutes (full) or 8-10 minutes (quick)
> **URL:** http://localhost:3030 or deployed URL

---

## Pre-Demo Checklist

- [ ] Server running (`npm run dev`)
- [ ] Browser at full width (1440px+ recommended)
- [ ] No browser extensions visible
- [ ] Dark mode OFF (standard light theme)
- [ ] Open to landing page (`/`)

---

## Act 1: The Platform (2 min)

### Landing Page

**Navigate to:** `/`

**Say:** "SGM — Sales Governance Manager — is a platform that brings structure, compliance, and intelligence to sales compensation programs. Instead of spreadsheets and tribal knowledge, everything lives in one governed system."

**Point out:**
- The four operational modes (Design, Operate, Dispute, Oversee)
- Each mode serves a different persona and workflow

**Click:** "Get Started" or any mode card

---

## Act 2: The Four Modes (3 min)

### Design Mode

**Navigate to:** `/design`

**Say:** "Design mode is where compensation architects build the governance framework. You have 26 policies, 56 template sections, and 6 frameworks — all pre-built from BHG best practices."

**Point out:**
- Policy Library (26 SCP policies)
- Plan Templates (56 sections)
- Frameworks (6 governance pillars)
- Governance Matrix and Gap Analysis tools

### Operate Mode

**Navigate to:** `/operate`

**Say:** "Once the framework is designed, Operate mode handles day-to-day execution — document management, plan approvals, and workflow tracking."

**Point out:**
- Document Library (48 documents with versioning)
- Pending Approvals (3) with SLA tracking
- Active Plans (12)

### Dispute Mode

**Navigate to:** `/dispute`

**Say:** "Disputes are inevitable — commission disagreements, territory changes, windfall deals. Dispute mode gives you structured resolution with SLA enforcement."

**Point out:**
- Active Cases (4), High Priority (1)
- SLA tracking (Approaching: 2)
- Average resolution time (3.5 days)
- Resolution SLAs by urgency (Standard 5 days, Urgent 2 days, Critical same day)

### Oversee Mode

**Navigate to:** `/oversee`

**Say:** "Oversee mode is for governance leaders — committee management, audit trails, and compliance monitoring. Two committees govern the system."

**Point out:**
- SGCC (Sales Governance Compliance Committee) — 7 members
- CRB (Compensation Review Board) — 5 members
- 96% compliance rate
- Decision tracking (8 this month)

---

## Act 3: Client Dashboard — The Money Slide (4 min)

**Navigate to:** `/client/acme-corp`

**Say:** "This is where it gets real. Each client engagement gets a dedicated dashboard showing their governance posture — gaps, risks, and a roadmap to compliance."

### Key Metrics

**Point out the 4 headline numbers:**
- 27 Plans Analyzed
- 8 Critical Gaps (red — these need attention)
- 64 Average Risk Score (high risk)
- 68% Coverage (+5% trend — improving)

**Say:** "In 30 seconds, any stakeholder can see the governance health of this client's compensation program."

### Coverage Matrix

**Navigate to:** `/client/acme-corp/coverage`

**Say:** "The coverage matrix maps every compensation plan against every policy area. Green means full coverage, yellow means partial, red means gaps. This is the heat map that drives remediation."

**Point out:**
- Plans as rows, policy areas as columns
- Color-coded coverage status (FULL/LIMITED/NO)
- Notes on specific gaps

### Gap Analysis

**Navigate to:** `/client/acme-corp/gaps`

**Say:** "Each gap is tracked with severity, status, policy reference, and assignment. Critical gaps get escalated; planned gaps get timelines."

**Point out:**
- Severity levels (CRITICAL, HIGH, MEDIUM, LOW)
- Status tracking (OPEN, PLANNED, IN_PROGRESS, RESOLVED)
- BHG policy references (SCP-001 through SCP-017)

### Implementation Roadmap

**Navigate to:** `/client/acme-corp/roadmap`

**Say:** "The roadmap turns analysis into action — four phases from discovery to handoff, with milestone tracking and completion percentages."

**Point out:**
- Phase 1: Discovery & Gap Analysis (100% complete)
- Phase 2: Policy Framework Design (60% in progress)
- Phase 3: Implementation & Rollout (not started)
- Phase 4: Validation & Handoff (not started)

---

## Act 4: Governance in Action (4 min)

### Governance Matrix

**Navigate to:** `/governance-matrix`

**Say:** "The governance matrix is the master view — every policy, its coverage status, approval authority, risk level, and SLA. You can filter, search, and export to PDF."

**Demonstrate:**
1. Click a policy row to see detail in right pane
2. Use the Coverage filter (show only GAPs)
3. Use the Authority filter (show only SGCC-required)
4. Click "Export to PDF" button

### Approvals Workflow

**Navigate to:** `/approvals`

**Say:** "Every significant change goes through an approval workflow. SGCC handles policy approvals; CRB handles exceptions and windfall deals. SLA tracking ensures nothing stalls."

**Demonstrate:**
1. Click a pending approval item
2. Show the detail pane: requestor, amount, SLA countdown
3. Show the approvers list with voting status
4. Point out CRB Decision Options (for windfall items)
5. Show action buttons: Approve, Reject, Request More Info

### Cases

**Navigate to:** `/cases`

**Say:** "Cases are disputes, exceptions, territory changes — anything that needs structured resolution. Each case has a timeline, financial impact tracking, and committee escalation."

**Demonstrate:**
1. Click an active case
2. Show the timeline (vertical event history)
3. Point out financial impact and affected rep
4. Show committee badge (which committee owns it)
5. Show resolution section (for resolved cases)

---

## Act 5: The AI Chiefs (3 min)

**Say:** "Four AI assistants — we call them Chiefs — are always available. They float in the corners of every page, providing intelligence without interrupting your workflow."

### AskSGM (Bottom Right)

**Click:** The gradient chat bubble orb

**Say:** "AskSGM is your governance knowledge assistant. Ask it anything about policies, processes, or compliance."

**Demonstrate:**
1. Click a quick question: "What is the SGCC approval process?"
2. Show the response (markdown-rendered, with structured answer)
3. Point out page context awareness

**Say:** "It knows what page you're on and tailors its guidance accordingly."

### OpsChief (Bottom Left)

**Click:** The purple activity log orb

**Say:** "OpsChief monitors system health and surfaces governance insights — SLA breaches, approval bottlenecks, compliance drift."

**Point out:**
- Alert/Warning/Info counts
- Severity-coded insight cards
- Suggested actions for each insight

### Pulse (Left of Center)

**Click:** The lightning bolt orb

**Say:** "Pulse delivers real-time AI recommendations — proactive coaching from the system about what needs attention right now."

**Point out:**
- Urgency-coded cards (critical red, high yellow)
- Dismiss and Mark Done actions
- Active count badge on the orb

### Task Orb (Right of Center)

**Click:** The teal list orb

**Say:** "The Task orb tracks governance work items — what's active, what's blocked, what's high priority."

**Point out:**
- Active/In Progress/Blocked/High Priority stats
- Task cards with status and priority badges

---

## Act 6: Committee Deep Dive (2 min, optional)

**Navigate to:** `/committees`

**Say:** "Two committees govern the system. The SGCC handles policy and compliance; the CRB handles exceptions and special cases."

**Demonstrate:**
1. Click SGCC in left nav
2. Show Members tab (7 members, voting/non-voting roles)
3. Click Authority & Scope tab (approval thresholds table)
4. Click Decision Framework tab (SGCC thresholds by amount)
5. Switch to CRB
6. Show Decision Framework (6 windfall deal options with rationale)

**Say:** "The CRB has six standardized options for windfall deals — from standard processing to pooled distribution. Each has clear rationale and examples. No more ad-hoc decisions."

---

## Act 7: Policy Library (1 min, optional)

**Navigate to:** `/policies`

**Say:** "17 governance policies — from Clawback and Recovery to International Requirements. Each is structured with scope, definitions, procedures, and compliance requirements."

**Point out:**
- Policy codes (SCP-001 through SCP-017)
- Categories: Financial Controls, Performance Management, Legal Compliance, etc.
- 36,000+ words of policy content

---

## Closing (1 min)

**Navigate back to:** `/`

**Say:** "SGM brings governance to compensation — structured, intelligent, and auditable. Design your framework, operate within it, resolve disputes with SLA enforcement, and oversee everything through committees with clear authority."

**Key differentiators to emphasize:**
1. **Pre-built governance framework** — 17 policies, 6 frameworks, not starting from scratch
2. **Client-specific dashboards** — Gap analysis, risk scoring, implementation roadmaps
3. **AI-powered intelligence** — Four Chiefs providing continuous governance insights
4. **Structured resolution** — Cases, approvals, and committees with SLA tracking
5. **Audit trail** — Every action, decision, and change is logged

---

## Quick Demo Path (8-10 min)

If time is limited, hit these stops:

1. **Landing page** — Show four modes (30 sec)
2. **Client dashboard** — Key metrics, coverage matrix (3 min)
3. **Governance matrix** — Filter and export (2 min)
4. **Approvals** — Show an approval with SLA (1 min)
5. **AskSGM orb** — Ask one question (1 min)
6. **Closing** — Key differentiators (1 min)

---

## Handling Questions

| Question | Answer |
|----------|--------|
| "Is this real data?" | "This is a demo with synthetic data. Production deployments connect to client compensation systems." |
| "How long to implement?" | "The framework is pre-built. Client onboarding is typically 4-12 weeks depending on complexity." |
| "Does it integrate with our comp system?" | "Yes — the architecture supports adapters for Xactly, Varicent, CaptivateIQ, and custom systems." |
| "Who uses each mode?" | "Design: Comp architects. Operate: Comp admins. Dispute: Reps and managers. Oversee: VP Comp and governance leaders." |
| "What about security?" | "PII protection guardrails are active. AI responses never surface individual compensation data." |
| "Can we customize policies?" | "The 17 SCP policies are starting templates. Each client engagement customizes them to their program." |
