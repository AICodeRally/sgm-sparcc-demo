# DECISION_RECORD_SCHEMA.md
> All governance-grade outputs must be representable as a Decision Record.
> This is the audit object you store, render, and diff over time.

---

## 1) Core Fields

| Field | Type | Description |
|-------|------|-------------|
| `decision_id` | string (uuid) | Unique identifier |
| `decision_type` | enum | RULING \| EXCEPTION_PACKET \| DISPUTE_KIT \| CHANGE_CONTROL_MEMO \| GOVERNANCE_GAP |
| `status` | enum | Draft \| Proposed \| Approved \| Published \| Closed \| Rejected |
| `tenant_id` | string | Tenant identifier |
| `created_at` | timestamp | Creation timestamp |
| `created_by` | string | User who created |
| `requester_role` | enum | Rep \| Manager \| SalesOps \| Finance \| Admin \| Auditor |
| `plan_ref` | object | { plan_year, plan_version, plan_doc_id } |
| `cycle_state` | enum | Open \| Pre-Close \| Closed \| Post-Close \| True-Up |
| `domain_tags` | string[] | Taxonomy tags for retrieval |
| `summary` | string | 1-2 line summary |

---

## 2) Authority & Evidence

### Authority Basis
```json
{
  "authority_basis": [
    {
      "source_tier": "ApprovedPolicy",
      "doc_id": "policy_F-001",
      "anchor": "§2.1 California Requirements",
      "excerpt_ref": "p3-4",
      "effective_start": "2026-01-01",
      "effective_end": "2026-12-31",
      "policy_code": "F-001",
      "severity": "CRITICAL"
    }
  ]
}
```

### Evidence Basis
```json
{
  "evidence_basis": [
    {
      "system": "ICM",
      "record_id": "credit_8891",
      "timestamp": "2026-01-08T10:22:00-07:00",
      "field_refs": ["split=0.5", "booking_date=2026-01-05"],
      "notes": "Credit record from system of record"
    },
    {
      "system": "CRM",
      "record_id": "opp_12345",
      "timestamp": "2026-01-05T14:30:00-07:00",
      "field_refs": ["close_date", "amount", "owner"],
      "notes": "Opportunity record"
    }
  ]
}
```

---

## 3) Decision Logic

```json
{
  "decision_logic": {
    "rule_applied": "No retro split adjustments after Pre-Close without exception approval",
    "conditions_met": [
      "cycle_state = Pre-Close",
      "split already posted to ICM",
      "no prior exception approval"
    ],
    "constraints": [
      "D-001 §2.1: Retro changes require VP Sales + Finance",
      "B-001 §4.2: Split locked at booking"
    ],
    "rationale": "Maintains control integrity and prevents post-hoc manipulation. Evidence shows split was correctly calculated at booking per system of record."
  }
}
```

### Risk Assessment (optional)
```json
{
  "risk_assessment": {
    "risk_type": "Compliance",
    "severity": "HIGH",
    "jurisdiction": "CA",
    "multiplier": 1.5,
    "notes": "California Labor Code §2751 applies. Waiting time penalties possible.",
    "legal_review_required": true
  }
}
```

---

## 4) Routing / Approvals

```json
{
  "owner": {
    "role": "SalesOps",
    "person_id": "user_456"
  },
  "approvals_required": [
    {
      "approver_role": "VP Sales",
      "approver_id": "user_789",
      "approval_type": "Exception",
      "due_by": "2026-01-10T17:00:00-07:00",
      "status": "Pending"
    },
    {
      "approver_role": "Finance Approver",
      "approver_id": "user_012",
      "approval_type": "Exception",
      "due_by": "2026-01-10T17:00:00-07:00",
      "status": "Pending"
    }
  ],
  "sla": {
    "target_hours": 48,
    "escalation_path": "Director RevOps → CFO"
  }
}
```

---

## 5) Outputs

```json
{
  "rep_safe_message": "Your dispute is under review. Current crediting remains in place unless an approved exception is granted. Next update within 48 hours.",
  "internal_detail": "Pre-close retro change request. Require exception chain per D-001. Split locked per B-001 §4.2. Log for audit.",
  "next_steps": [
    "Collect CRM booking timestamp",
    "Validate ICM calc run id",
    "Route exception packet to VP Sales + Finance",
    "Notify rep of ruling within SLA"
  ],
  "audit_note": "SGM:RULING Proposed | credit split upheld | retro change requires exception approvals | refs: B-001 §4.2, D-001 §2.1, ICM:credit_8891"
}
```

---

## 6) Missing Items (for Draft/Escalate)

```json
{
  "missing_authority": [
    "No policy for multi-country credit allocation",
    "F-003 silent on crediting mechanics"
  ],
  "missing_evidence": [
    "CRM booking timestamp not provided",
    "Manager attestation required"
  ],
  "blockers": [
    "Cannot proceed without VP Sales approval",
    "Legal review required for CRITICAL policy"
  ]
}
```

---

## 7) Complete JSON Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "DecisionRecord",
  "type": "object",
  "required": [
    "decision_id",
    "decision_type",
    "status",
    "tenant_id",
    "created_at",
    "created_by",
    "summary",
    "authority_basis",
    "evidence_basis",
    "decision_logic",
    "next_steps",
    "audit_note"
  ],
  "properties": {
    "decision_id": { "type": "string", "format": "uuid" },
    "decision_type": {
      "type": "string",
      "enum": ["RULING", "EXCEPTION_PACKET", "DISPUTE_KIT", "CHANGE_CONTROL_MEMO", "GOVERNANCE_GAP"]
    },
    "status": {
      "type": "string",
      "enum": ["Draft", "Proposed", "Approved", "Published", "Closed", "Rejected"]
    },
    "tenant_id": { "type": "string" },
    "created_at": { "type": "string", "format": "date-time" },
    "created_by": { "type": "string" },
    "requester_role": {
      "type": "string",
      "enum": ["Rep", "Manager", "SalesOps", "Finance", "Admin", "Auditor"]
    },
    "plan_ref": {
      "type": "object",
      "properties": {
        "plan_year": { "type": "integer" },
        "plan_version": { "type": "string" },
        "plan_doc_id": { "type": "string" }
      }
    },
    "cycle_state": {
      "type": "string",
      "enum": ["Open", "Pre-Close", "Closed", "Post-Close", "True-Up"]
    },
    "domain_tags": { "type": "array", "items": { "type": "string" } },
    "summary": { "type": "string" },
    "authority_basis": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "source_tier": { "type": "string" },
          "doc_id": { "type": "string" },
          "anchor": { "type": "string" },
          "excerpt_ref": { "type": "string" },
          "effective_start": { "type": "string", "format": "date" },
          "effective_end": { "type": "string", "format": "date" },
          "policy_code": { "type": "string" },
          "severity": { "type": "string" }
        }
      }
    },
    "evidence_basis": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "system": { "type": "string" },
          "record_id": { "type": "string" },
          "timestamp": { "type": "string", "format": "date-time" },
          "field_refs": { "type": "array", "items": { "type": "string" } },
          "notes": { "type": "string" }
        }
      }
    },
    "decision_logic": {
      "type": "object",
      "properties": {
        "rule_applied": { "type": "string" },
        "conditions_met": { "type": "array", "items": { "type": "string" } },
        "constraints": { "type": "array", "items": { "type": "string" } },
        "rationale": { "type": "string" }
      }
    },
    "risk_assessment": {
      "type": "object",
      "properties": {
        "risk_type": { "type": "string" },
        "severity": { "type": "string" },
        "jurisdiction": { "type": "string" },
        "multiplier": { "type": "number" },
        "notes": { "type": "string" },
        "legal_review_required": { "type": "boolean" }
      }
    },
    "owner": {
      "type": "object",
      "properties": {
        "role": { "type": "string" },
        "person_id": { "type": "string" }
      }
    },
    "approvals_required": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "approver_role": { "type": "string" },
          "approver_id": { "type": "string" },
          "approval_type": { "type": "string" },
          "due_by": { "type": "string", "format": "date-time" },
          "status": { "type": "string" }
        }
      }
    },
    "sla": {
      "type": "object",
      "properties": {
        "target_hours": { "type": "integer" },
        "escalation_path": { "type": "string" }
      }
    },
    "rep_safe_message": { "type": "string" },
    "internal_detail": { "type": "string" },
    "next_steps": { "type": "array", "items": { "type": "string" } },
    "audit_note": { "type": "string" },
    "missing_authority": { "type": "array", "items": { "type": "string" } },
    "missing_evidence": { "type": "array", "items": { "type": "string" } },
    "blockers": { "type": "array", "items": { "type": "string" } }
  }
}
```

---

## 8) Example Full Record

```json
{
  "decision_id": "dec_a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "decision_type": "RULING",
  "status": "Proposed",
  "tenant_id": "tenant_demo",
  "created_at": "2026-01-09T16:12:00-07:00",
  "created_by": "user_ops_456",
  "requester_role": "SalesOps",
  "plan_ref": {
    "plan_year": 2026,
    "plan_version": "v3.1",
    "plan_doc_id": "doc_plan_2026_v3_1"
  },
  "cycle_state": "Pre-Close",
  "domain_tags": ["SGM", "Dispute", "Crediting", "B-001"],
  "summary": "Ruling: split credit remains 50/50; no retro change permitted without VP Sales + Finance approval.",
  "authority_basis": [
    {
      "source_tier": "ApprovedPolicy",
      "doc_id": "policy_B-001",
      "anchor": "§4.2 Crediting Splits",
      "excerpt_ref": "p12",
      "effective_start": "2026-01-01",
      "effective_end": "2026-12-31",
      "policy_code": "B-001",
      "severity": "HIGH"
    },
    {
      "source_tier": "ApprovedPolicy",
      "doc_id": "policy_D-001",
      "anchor": "§2.1 Retroactivity Restrictions",
      "excerpt_ref": "p5",
      "effective_start": "2026-01-01",
      "effective_end": "2026-12-31",
      "policy_code": "D-001",
      "severity": "HIGH"
    }
  ],
  "evidence_basis": [
    {
      "system": "ICM",
      "record_id": "credit_8891",
      "timestamp": "2026-01-08T10:22:00-07:00",
      "field_refs": ["split=0.5"],
      "notes": "Credit record from system of record"
    },
    {
      "system": "CRM",
      "record_id": "opp_12345",
      "timestamp": "2026-01-05T14:30:00-07:00",
      "field_refs": ["close_date=2026-01-05", "amount=50000"],
      "notes": "Booking record"
    }
  ],
  "decision_logic": {
    "rule_applied": "No retro split adjustments after Pre-Close without exception approval",
    "conditions_met": [
      "cycle_state = Pre-Close",
      "split already posted to ICM"
    ],
    "constraints": [
      "D-001 §2.1: Retro requires VP Sales + Finance",
      "B-001 §4.2: Split locked at booking"
    ],
    "rationale": "Maintains control integrity and prevents post-hoc manipulation."
  },
  "risk_assessment": {
    "risk_type": "Governance",
    "severity": "Medium",
    "jurisdiction": "DEFAULT",
    "multiplier": 1.0,
    "notes": "Standard governance risk - no compliance exposure",
    "legal_review_required": false
  },
  "owner": { "role": "SalesOps", "person_id": "user_ops_456" },
  "approvals_required": [
    {
      "approver_role": "VP Sales",
      "approval_type": "Exception",
      "due_by": "2026-01-11T17:00:00-07:00",
      "status": "Pending"
    },
    {
      "approver_role": "Finance Approver",
      "approval_type": "Exception",
      "due_by": "2026-01-11T17:00:00-07:00",
      "status": "Pending"
    }
  ],
  "sla": {
    "target_hours": 48,
    "escalation_path": "Director RevOps → CFO"
  },
  "rep_safe_message": "Your dispute is under review. Current crediting remains in place unless an approved exception is granted. Next update within 48 hours.",
  "internal_detail": "Pre-close retro change request. Require exception chain per D-001. Split locked per B-001 §4.2. Log for audit.",
  "next_steps": [
    "Notify rep of ruling",
    "If exception requested, route to VP Sales + Finance",
    "Document in dispute log",
    "Close within SLA"
  ],
  "audit_note": "SGM:RULING Proposed | credit split 50/50 upheld | retro denied per D-001 §2.1 | refs: B-001, ICM:credit_8891",
  "missing_authority": [],
  "missing_evidence": [],
  "blockers": []
}
```
