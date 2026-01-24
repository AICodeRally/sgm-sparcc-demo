# AICR Integration Request for SGM

> **To:** Rally (AICR Team)
> **From:** SGM Team
> **Date:** January 23, 2026
> **Priority:** High - Blocking production readiness

---

## Summary

SGM is ready for production (Feb 1 handoff, March 1 launch) but **4 tasks are blocked** waiting on AICR deployment and configuration.

---

## What We Need

### 1. Agent Conductor Production Deployment
**Status:** Pending
**Blocking:** All AI orb functionality except Ask

We need the Agent Conductor deployed to production so SGM can connect to AICR telemetry endpoints.

### 2. Production API Keys
**Status:** Pending
**Blocking:** AI features in production

Need verified production API keys for:
- Anthropic (Claude)
- OpenAI (if used for embeddings)

### 3. Telemetry Endpoint Access
**Status:** Pending
**Blocking:** Ops and Pulse orbs

SGM needs to call these AICR endpoints:

| Endpoint | Purpose | SGM Component |
|----------|---------|---------------|
| `/api/aicc/telemetry` | Read signals from ops_signals table | Ops orb, Pulse orb |
| `/api/aicc/agents/[slug]/invoke` | Invoke AI agent | Ask orb (already working) |

**Signal types SGM will consume:**

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
| AICR client library | ✅ Done | `lib/aicr/client.ts` |
| Ask orb | ✅ Wired | Already calling AICR |
| Ops orb UI | ✅ Built | Waiting for telemetry endpoint |
| Pulse orb UI | ✅ Built | Waiting for telemetry endpoint |
| Task orb UI | ✅ Built | Waiting for work management signals |
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
