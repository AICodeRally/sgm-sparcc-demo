# AICR Integration Status for SGM

> **To:** Rally (AICR Team)
> **From:** SGM Team
> **Date:** January 23, 2026
> **Updated:** January 23, 2026
> **Priority:** High - API keys blocking production

---

## Summary

Rally has delivered Agent Conductor and telemetry endpoints. SGM has wired Ops and Pulse orbs to AICR. **Only API keys remain blocking.**

---

## Current Status

### 1. Agent Conductor Production Deployment
**Status:** ✅ Complete (Rally)
**Notes:** Migration applied, v1.1 columns verified

### 2. Production API Keys
**Status:** ⚠️ BLOCKING
**Issue:** Both OPENAI_API_KEY and ANTHROPIC_API_KEY return 401 errors in Vercel

**Action Required:** Update API keys in Vercel with valid credentials.

### 3. Telemetry Endpoint Access
**Status:** ✅ Complete (Rally)
**Notes:** Extended with `?signals=` filter

SGM now calls these AICR endpoints:

| Endpoint | Purpose | SGM Component |
|----------|---------|---------------|
| `/api/aicc/telemetry?signals=OPS` | OPS signals | Ops orb ✅ Wired |
| `/api/aicc/telemetry?signals=PULSE` | PULSE signals | Pulse orb ✅ Wired |
| `/api/aicc/telemetry?signals=AI_TEL` | Shared AI telemetry | Both orbs |
| `/api/aicc/agents/[slug]/invoke` | Invoke AI agent | Ask orb ✅ Working |

**Signal types SGM consumes:**

```
OPS_ANOMALY_*     → Ops orb (pattern detected)
OPS_THRESHOLD_*   → Ops orb (metric crossed)
OPS_DRIFT_*       → Ops orb (config/behavior drift)
AI_TEL_*          → Shared telemetry
PULSE_RECOMMEND_* → Pulse orb (proactive recommendations)
PULSE_LEARN_*     → Pulse orb (learning opportunities)
PULSE_ACTION_*    → Pulse orb (suggested actions)
```

### 4. SGM Guardrails Configuration (Optional)
**Status:** Pending
**Blocking:** Nothing - can launch without

PII protection and response filtering for SGM-specific context. Nice to have but not blocking launch.

---

## What SGM Has Ready

| Component | Status | Notes |
|-----------|--------|-------|
| AICR client library | ✅ Done | `lib/aicr/client.ts` with telemetry methods |
| Ask orb | ✅ Wired | Calling AICR agents/invoke |
| Ops orb | ✅ Wired | Calling `/api/aicc/telemetry?signals=OPS` |
| Pulse orb | ✅ Wired | Calling `/api/aicc/telemetry?signals=PULSE` |
| Task orb UI | ✅ Built | Waiting for work management signals (TBD) |
| Offline handling | ✅ Done | All orbs show "service offline" gracefully |

---

## Integration Code Ready

### Ops Orb (when endpoint available)
```typescript
// components/ai/OpsChiefOrb.tsx
const response = await fetch(`${AICR_API}/api/aicc/telemetry?types=OPS_,AI_TEL_&limit=20`);
const signals = await response.json();
// Map to Insight[] format
```

### Pulse Orb (when endpoint available)
```typescript
// components/ai/PulseOrb.tsx
const response = await fetch(`${AICR_API}/api/aicc/telemetry?types=PULSE_&limit=10`);
const signals = await response.json();
// Map to PulseCard[] format
```

---

## Timeline

| Date | Milestone |
|------|-----------|
| **Now** | SGM Priority 2 complete, waiting on AICR |
| **Jan 28** | Need AICR endpoints available for testing |
| **Jan 29-31** | End-to-end orb testing |
| **Feb 1** | Handoff to testing teams |
| **March 1** | Production launch |

---

## Contact

For questions about SGM integration requirements:
- Check `lib/aicr/client.ts` for existing AICR client
- Check `components/ai/OpsChiefOrb.tsx` and `PulseOrb.tsx` for UI components
- Production readiness plan: `docs/plans/2026-01-23-sgm-production-readiness.md`

---

## References

AICR docs (Rally's implementation plan):
- Architecture: `/Users/toddlebaron/dev/aicr/docs/plans/2026-01-23-sgm-ai-orbs-architecture-design.md`
- Implementation: `/Users/toddlebaron/dev/aicr/docs/plans/2026-01-23-sgm-aicr-implementation.md`
