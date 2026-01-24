# SGM Production Readiness Plan

> **Target:** March 1, 2026 Launch
> **Handoff to Testing:** February 1, 2026
> **Working Days:** ~9 days
> **Last Updated:** January 23, 2026

---

## Executive Summary

SGM (Sales Governance Manager) is ~95% complete. This plan covers the remaining work to achieve production readiness for the March 1st launch, with handoff to testing teams by February 1st.

### Key Findings from Audit

| Area | Status | Notes |
|------|--------|-------|
| **Pages** | ✅ Complete | All 66+ pages fully implemented (no stubs) |
| **APIs** | ✅ Complete | All endpoints exist and connected |
| **Policies** | ✅ Complete | 17 SCP policies (36,000+ words) |
| **Matrices** | ✅ Complete | Governance Matrix + Coverage Matrix |
| **AI Orbs** | ⚠️ Needs Work | 4 orbs need AICR telemetry wiring |

---

## AI Orbs Architecture Decision

**Final: 4 orbs (KB deferred)**

| Orb | Role | Behavior | AICR Status |
|-----|------|----------|-------------|
| **Ask** | Conversational Q&A | User asks, AI answers | ✅ Connected |
| **Ops** | Deep pattern detection | Passive → alerts when significant | 🔧 Wire to shared engine |
| **Pulse** | Proactive coaching | Active → daily recommendations | 🔧 Wire to shared engine |
| **Task** | Work management | Task tracking & status | 🔧 Wire separately |
| **KB** | Plan-editing boilerplate | Connect to RAG | Deferred post-launch |

### Backend Architecture

```
AICR Telemetry Feed (/api/aicc/telemetry)
         │
         ▼
 Master Analysis Engine (1 integration)
    ├── Detector Mode → Ops Alerts
    │   - OPS_ANOMALY_* (pattern detected)
    │   - OPS_THRESHOLD_* (metric crossed)
    │   - OPS_DRIFT_* (config/behavior drift)
    │   - AI_TEL_* (shared AI telemetry)
    │
    └── Coach Mode → Pulse Cards
        - PULSE_RECOMMEND_* (proactive recommendations)
        - PULSE_LEARN_* (learning opportunities)
        - PULSE_ACTION_* (suggested actions)
```

### AICR Endpoints for SGM

| Endpoint | Purpose | Used By |
|----------|---------|---------|
| `/api/aicc/telemetry` | Read signals from ops_signals table | Ops, Pulse |
| `/api/aicc/agents/[slug]/invoke` | Invoke AI agent | Ask (already wired) |
| `/api/ai/opschief` | Ops-specific alerts | Ops orb |
| `/api/pulse` | Coach insights | Pulse orb |

### Work Split

| Task | Owner |
|------|-------|
| Deploy Agent Conductor to prod | Rally (AICR) |
| Configure SGM guardrails | Rally (AICR) |
| Verify prod API keys | Rally (AICR) |
| Wire Ops/Pulse to AICR telemetry | SGM |
| Wire Task to AICR | SGM |
| Test 4 orbs end-to-end | SGM |

---

## SGM-Side Implementation Details

### Wiring Ops to AICR

**Current:** `OpsChiefOrb.tsx` calls `/api/ai/opschief` which returns local mock data.

**Target:** Call AICR `/api/aicc/telemetry` filtering for `OPS_*` and `AI_TEL_*` signals.

```typescript
// components/ai/OpsChiefOrb.tsx
const response = await fetch(`${AICR_API}/api/aicc/telemetry?types=OPS_,AI_TEL_&limit=20`);
const data = await response.json();
// Map signals to Insight[] format
```

### Wiring Pulse to AICR

**Current:** `PulseOrb.tsx` calls `pulse-service.ts` which returns local mock data.

**Target:** Call AICR `/api/aicc/telemetry` filtering for `PULSE_*` signals.

```typescript
// components/ai/PulseOrb.tsx
const response = await fetch(`${AICR_API}/api/aicc/telemetry?types=PULSE_&limit=10`);
const data = await response.json();
// Map signals to PulseCard[] format
```

### Wiring Task to AICR

**Current:** `TaskOrb.tsx` calls `task-service.ts` locally.

**Target:** Route through AICR for work management signals (TBD with Rally).

---

## Production Readiness Tasks

### Priority 1: High (Must Complete)

| # | Task | Description | Est. Effort |
|---|------|-------------|-------------|
| 1.1 | Page Verification | Run through all 66 pages, confirm no console errors | 1 day |
| 1.2 | API Verification | Test all endpoints return valid data | 0.5 day |
| 1.3 | Document Upload Flow | Verify upload → parse → gap analysis → recommendations | 0.5 day |
| 1.4 | Approval Workflow | Verify submit → review → approve/reject flow | 0.5 day |
| 1.5 | Case Workflow | Verify case creation → timeline → resolution | 0.5 day |
| 1.6 | Wire Ops to AICR | Emit AI_TEL_* signals to /api/aicc/telemetry | 1 day |
| 1.7 | Wire Pulse to AICR | Emit PULSE_* signals to shared telemetry | 0.5 day |
| 1.8 | Wire Task to AICR | Connect task service to AICR | 0.5 day |
| 1.9 | Test All 4 Orbs | End-to-end verification with AICR | 1 day |

**Subtotal Priority 1:** ~6 days

### Priority 2: Medium (Should Complete)

| # | Task | Description | Est. Effort |
|---|------|-------------|-------------|
| 2.1 | Empty States | All list views show helpful message when empty | 0.5 day |
| 2.2 | Loading States | Skeleton loaders or spinners on data fetch | 0.5 day |
| 2.3 | Error Handling | Graceful error messages, not raw exceptions | 0.5 day |
| 2.4 | Demo Data Seeding | Seed realistic client scenario data | 0.5 day |
| 2.5 | Demo Script | Written walkthrough for presenters | 0.5 day |

**Subtotal Priority 2:** ~2.5 days

### Priority 3: Low (Nice to Have)

| # | Task | Description | Est. Effort |
|---|------|-------------|-------------|
| 3.1 | Export to PDF | Gap analysis, matrices exportable | 1 day |
| 3.2 | Print-friendly Views | Governance matrix, coverage matrix | 0.5 day |
| 3.3 | Quick-action Dashboard | "3 pending approvals" summary | 0.5 day |

**Subtotal Priority 3:** ~2 days

---

## Timeline

```
Jan 23-24: Page & API verification (1.1, 1.2)
Jan 25-26: Workflow verification (1.3, 1.4, 1.5)
Jan 27-29: AICR integration (1.6, 1.7, 1.8, 1.9)
Jan 30-31: Polish & demo prep (2.1-2.5)
Feb 1:     Handoff to testing
```

---

## Dependencies

### From Rally (AICR Side)

| Dependency | Status | Blocking? |
|------------|--------|-----------|
| Agent Conductor prod deploy | Pending | Yes - for orb testing |
| Prod API keys (Anthropic, OpenAI) | Pending | Yes - for AI features |
| SGM guardrails config | Pending | No - can launch without |

### From SGM Side

| Item | Status |
|------|--------|
| AskSGM already wired to AICR | ✅ Done |
| Ops/Pulse/Task orbs built | ✅ Done (UI exists) |
| AICR client library | ✅ Done (`lib/aicr/client.ts`) |

---

## Verification Checklist

### Core Workflows

- [ ] Document upload parses correctly
- [ ] Gap analysis generates results
- [ ] Policy recommendations appear
- [ ] Approval workflow completes
- [ ] Case lifecycle works (create → assign → resolve)
- [ ] Committee views load correctly
- [ ] Audit timeline shows events

### AI Orbs

- [ ] Ask orb responds with governance answers
- [ ] Ops orb shows pattern alerts from AICR
- [ ] Pulse orb shows coaching recommendations
- [ ] Task orb displays work items
- [ ] All orbs handle "service offline" gracefully

### UI Polish

- [ ] No console errors on any page
- [ ] Empty states are user-friendly
- [ ] Loading states are visible
- [ ] Error messages are helpful
- [ ] Demo/client data toggle works

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| AICR prod not ready | Medium | High | Ask works locally; Ops/Pulse show offline |
| API keys missing | Low | High | Rally tracking - verify by Jan 28 |
| Edge case bugs in workflows | Medium | Medium | Prioritize core happy paths |
| Demo data insufficient | Low | Low | Can seed more if needed |

---

## Success Criteria

**For Feb 1 Handoff:**

1. All 66 pages render without errors
2. Core workflows (upload, approve, case) complete successfully
3. At least Ask + Ops orbs connected to AICR
4. Demo walkthrough documented
5. No P0 bugs in happy paths

**For March 1 Launch:**

1. Testing team has verified all workflows
2. All 4 orbs fully connected and tested
3. Client-ready demo environment
4. Presenter training complete

---

## References

### AICR Docs (Read-Only)

- **Architecture:** `/Users/toddlebaron/dev/aicr/docs/plans/2026-01-23-sgm-ai-orbs-architecture-design.md`
- **Implementation:** `/Users/toddlebaron/dev/aicr/docs/plans/2026-01-23-sgm-aicr-implementation.md`

Rally's implementation plan includes:
- Task 1-4: Agent Conductor prod deployment
- Task 5-6: Telemetry engine wiring (adds `AI_TEL_*`, `PULSE_*` signals)
- Task 7: SGM guardrails (PII protection)
- Task 8: End-to-end verification

### SGM Docs

- **CLAUDE.md:** Project overview and conventions
- **Architecture Context:** `.claude/architecture-context.md`
- **AICR Client:** `lib/aicr/client.ts` — existing AICR integration for AskSGM
