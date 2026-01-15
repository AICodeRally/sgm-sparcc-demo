/**
 * RAG Knowledge Loader for SPM Governance
 *
 * Unified knowledge base combining:
 * - 21 Template policies (A-001 to F-003) with Gold Standard Language
 * - 15 SPM Governance policies (SPM-POL-001 to SPM-POL-015) for operations
 * - 16 SCP policies from original knowledge base
 * - Procedures, Controls, Evidence for citation
 * - Cases and Decisions for precedent lookup
 *
 * All entries have citable IDs for bounded operator compliance.
 */

import { ALL_POLICIES_V2, type PolicyV2 } from './policy-library-v2';
import {
  GOVERNANCE_POLICIES,
  RISK_TRIGGERS,
  JURISDICTIONS,
  PATCH_TEMPLATES,
  type GovernancePolicy,
  type RiskTrigger,
  type Jurisdiction,
  type PatchTemplate,
} from './knowledge-base';

// Import seed data types
import seedData from '../../knowledge/spm-governance-pack/seed/SEED_DATASET.json';

// ============================================================================
// TYPES
// ============================================================================

export interface CitablePolicy {
  policyId: string;
  policyVersionId: string;
  name: string;
  category: string;
  section: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  effectiveDate: string;
  source: 'template' | 'spm-governance' | 'scp-legacy';
  description: string;
  requiredElements: string[];
  goldStandardLanguage?: string;
  rules?: Record<string, unknown>;
  ownerRoles?: string[];
  approverRoles?: string[];
}

export interface CitableProcedure {
  procedureId: string;
  name: string;
  status: string;
  triggers: string[];
  policyLinks: string[];
  states?: Array<{
    stateKey: string;
    outputs: string[];
    sortOrder: number;
  }>;
  transitions?: Array<{
    fromStateKey: string;
    toStateKey: string;
    conditions: string[];
  }>;
}

export interface CitableControl {
  controlId: string;
  name: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  controlType: 'preventive' | 'detective' | 'corrective';
  testProcedure: string;
  policyLinks: string[];
}

export interface CitableEvidence {
  evidenceId: string;
  type: string;
  title: string;
  hash?: string;
  metadata: Record<string, unknown>;
}

export interface CitableCase {
  caseId: string;
  caseType: 'exception' | 'dispute';
  status: string;
  openedAt: string;
  closedAt?: string;
  summary: string;
  policyVersionsInScope: string[];
  linkedEvidenceIds: string[];
  precedentTags: string[];
  resolution?: {
    outcome: string;
    triagePath: string;
    conditions: string[];
  };
}

export interface CitableDecision {
  decisionId: string;
  decisionType: string;
  decisionBody: string;
  outcome: string;
  timestamp: string;
  summary: string;
  policyVersionsInScope: string[];
  linkedEvidenceIds: string[];
  precedentTags: string[];
  conditions: string[];
}

export interface PrecedentTag {
  tagId: string;
  name: string;
  category: string;
  description: string;
}

export interface RAGKnowledgeBase {
  // Policy libraries
  templatePolicies: CitablePolicy[];
  spmGovernancePolicies: CitablePolicy[];
  scpLegacyPolicies: CitablePolicy[];
  allPolicies: CitablePolicy[];

  // Operational entities
  procedures: CitableProcedure[];
  controls: CitableControl[];
  evidence: CitableEvidence[];

  // Case law
  cases: CitableCase[];
  decisions: CitableDecision[];
  precedentTags: PrecedentTag[];

  // Risk and jurisdiction
  riskTriggers: RiskTrigger[];
  jurisdictions: Jurisdiction[];
  patchTemplates: PatchTemplate[];

  // Metadata
  loadedAt: string;
  version: string;
  counts: {
    totalPolicies: number;
    templatePolicies: number;
    spmGovernancePolicies: number;
    scpLegacyPolicies: number;
    procedures: number;
    controls: number;
    evidence: number;
    cases: number;
    decisions: number;
    precedentTags: number;
    riskTriggers: number;
    jurisdictions: number;
  };
}

// ============================================================================
// LOADERS
// ============================================================================

function loadTemplatePolicies(): CitablePolicy[] {
  return ALL_POLICIES_V2.map((p: PolicyV2) => ({
    policyId: p.code,
    policyVersionId: `${p.code}@v1.0`,
    name: p.name,
    category: p.category,
    section: p.section,
    severity: p.severity,
    effectiveDate: '2026-01-01',
    source: 'template' as const,
    description: p.summary,
    requiredElements: p.requiredElements,
    goldStandardLanguage: p.goldStandardLanguage,
  }));
}

function loadSPMGovernancePolicies(): CitablePolicy[] {
  return (seedData.policies as any[]).map((p) => {
    const version = (seedData.policy_versions as any[]).find(
      (v) => v.policy_id === p.policy_id
    );
    return {
      policyId: p.policy_id,
      policyVersionId: version?.policy_version_id || `${p.policy_id}@v1.0`,
      name: p.name,
      category: p.category,
      section: 'SPM Governance',
      severity: getSPMPolicySeverity(p.policy_id),
      effectiveDate: version?.effective_date || '2026-01-01',
      source: 'spm-governance' as const,
      description: `${p.name} - ${p.category}`,
      requiredElements: version?.required_artifacts || [],
      rules: version?.rules,
      ownerRoles: p.owner_roles,
      approverRoles: p.approver_roles,
    };
  });
}

function loadSCPLegacyPolicies(): CitablePolicy[] {
  return GOVERNANCE_POLICIES.map((p: GovernancePolicy) => ({
    policyId: p.code,
    policyVersionId: `${p.code}@v${p.version}`,
    name: p.name,
    category: p.category,
    section: p.frameworkArea,
    severity: getMaxRequirementSeverity(p),
    effectiveDate: '2026-01-01',
    source: 'scp-legacy' as const,
    description: p.description,
    requiredElements: p.requirements.flatMap(r => r.requiredElements),
  }));
}

function loadProcedures(): CitableProcedure[] {
  return (seedData.procedures as any[]).map((p) => ({
    procedureId: p.procedure_id,
    name: p.name,
    status: p.status,
    triggers: p.triggers,
    policyLinks: p.policy_links,
  }));
}

function loadControls(): CitableControl[] {
  return (seedData.controls as any[]).map((c) => ({
    controlId: c.control_id,
    name: c.name,
    severity: c.severity,
    controlType: c.control_type,
    testProcedure: c.test_procedure,
    policyLinks: c.policy_links,
  }));
}

function loadEvidence(): CitableEvidence[] {
  return (seedData.evidence as any[]).map((e) => ({
    evidenceId: e.evidence_id,
    type: e.type,
    title: e.title,
    hash: e.hash,
    metadata: e.metadata,
  }));
}

function loadCases(): CitableCase[] {
  return (seedData.cases as any[]).map((c) => ({
    caseId: c.case_id,
    caseType: c.case_type,
    status: c.status,
    openedAt: c.opened_at,
    closedAt: c.closed_at,
    summary: c.summary,
    policyVersionsInScope: c.policy_versions_in_scope,
    linkedEvidenceIds: c.linked_evidence_ids,
    precedentTags: c.precedent_tags,
    resolution: c.resolution ? {
      outcome: c.resolution.outcome,
      triagePath: c.resolution.triage_path,
      conditions: c.resolution.conditions,
    } : undefined,
  }));
}

function loadDecisions(): CitableDecision[] {
  return (seedData.decisions as any[]).map((d) => ({
    decisionId: d.decision_id,
    decisionType: d.decision_type,
    decisionBody: d.decision_body,
    outcome: d.outcome,
    timestamp: d.timestamp,
    summary: d.summary,
    policyVersionsInScope: d.policy_versions_in_scope,
    linkedEvidenceIds: d.linked_evidence_ids,
    precedentTags: d.precedent_tags,
    conditions: d.conditions,
  }));
}

function loadPrecedentTags(): PrecedentTag[] {
  return (seedData.precedent_tags as any[]).map((t) => ({
    tagId: t.tag_id,
    name: t.name,
    category: t.category,
    description: t.description,
  }));
}

// ============================================================================
// HELPERS
// ============================================================================

function getSPMPolicySeverity(policyId: string): 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' {
  // SPM policies related to controls and segregation are critical
  const criticalPolicies = ['SPM-POL-011', 'SPM-POL-012'];
  const highPolicies = ['SPM-POL-003', 'SPM-POL-006', 'SPM-POL-009', 'SPM-POL-010'];

  if (criticalPolicies.includes(policyId)) return 'CRITICAL';
  if (highPolicies.includes(policyId)) return 'HIGH';
  return 'MEDIUM';
}

function getMaxRequirementSeverity(policy: GovernancePolicy): 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' {
  const severities = policy.requirements.map(r => r.severity);
  if (severities.includes('CRITICAL')) return 'CRITICAL';
  if (severities.includes('HIGH')) return 'HIGH';
  if (severities.includes('MEDIUM')) return 'MEDIUM';
  return 'LOW';
}

// ============================================================================
// MAIN LOADER
// ============================================================================

let cachedKnowledgeBase: RAGKnowledgeBase | null = null;

export function loadRAGKnowledgeBase(forceReload = false): RAGKnowledgeBase {
  if (cachedKnowledgeBase && !forceReload) {
    return cachedKnowledgeBase;
  }

  const templatePolicies = loadTemplatePolicies();
  const spmGovernancePolicies = loadSPMGovernancePolicies();
  const scpLegacyPolicies = loadSCPLegacyPolicies();
  const allPolicies = [...templatePolicies, ...spmGovernancePolicies, ...scpLegacyPolicies];

  const procedures = loadProcedures();
  const controls = loadControls();
  const evidence = loadEvidence();
  const cases = loadCases();
  const decisions = loadDecisions();
  const precedentTags = loadPrecedentTags();

  cachedKnowledgeBase = {
    templatePolicies,
    spmGovernancePolicies,
    scpLegacyPolicies,
    allPolicies,
    procedures,
    controls,
    evidence,
    cases,
    decisions,
    precedentTags,
    riskTriggers: RISK_TRIGGERS,
    jurisdictions: JURISDICTIONS,
    patchTemplates: PATCH_TEMPLATES,
    loadedAt: new Date().toISOString(),
    version: '1.0.0',
    counts: {
      totalPolicies: allPolicies.length,
      templatePolicies: templatePolicies.length,
      spmGovernancePolicies: spmGovernancePolicies.length,
      scpLegacyPolicies: scpLegacyPolicies.length,
      procedures: procedures.length,
      controls: controls.length,
      evidence: evidence.length,
      cases: cases.length,
      decisions: decisions.length,
      precedentTags: precedentTags.length,
      riskTriggers: RISK_TRIGGERS.length,
      jurisdictions: JURISDICTIONS.length,
    },
  };

  return cachedKnowledgeBase;
}

// ============================================================================
// SEARCH FUNCTIONS
// ============================================================================

export function getPolicyByCode(code: string): CitablePolicy | undefined {
  const kb = loadRAGKnowledgeBase();
  return kb.allPolicies.find(p => p.policyId === code);
}

export function getPolicyVersionById(versionId: string): CitablePolicy | undefined {
  const kb = loadRAGKnowledgeBase();
  return kb.allPolicies.find(p => p.policyVersionId === versionId);
}

export function getPoliciesByCategory(category: string): CitablePolicy[] {
  const kb = loadRAGKnowledgeBase();
  return kb.allPolicies.filter(p =>
    p.category.toLowerCase().includes(category.toLowerCase())
  );
}

export function getPoliciesBySeverity(severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'): CitablePolicy[] {
  const kb = loadRAGKnowledgeBase();
  return kb.allPolicies.filter(p => p.severity === severity);
}

export function getCriticalPolicies(): CitablePolicy[] {
  return getPoliciesBySeverity('CRITICAL');
}

export function getControlById(controlId: string): CitableControl | undefined {
  const kb = loadRAGKnowledgeBase();
  return kb.controls.find(c => c.controlId === controlId);
}

export function getControlsByPolicy(policyId: string): CitableControl[] {
  const kb = loadRAGKnowledgeBase();
  return kb.controls.filter(c => c.policyLinks.includes(policyId));
}

export function getProcedureById(procedureId: string): CitableProcedure | undefined {
  const kb = loadRAGKnowledgeBase();
  return kb.procedures.find(p => p.procedureId === procedureId);
}

export function getEvidenceById(evidenceId: string): CitableEvidence | undefined {
  const kb = loadRAGKnowledgeBase();
  return kb.evidence.find(e => e.evidenceId === evidenceId);
}

export function getCaseById(caseId: string): CitableCase | undefined {
  const kb = loadRAGKnowledgeBase();
  return kb.cases.find(c => c.caseId === caseId);
}

export function getCasesByType(caseType: 'exception' | 'dispute'): CitableCase[] {
  const kb = loadRAGKnowledgeBase();
  return kb.cases.filter(c => c.caseType === caseType);
}

export function getDecisionById(decisionId: string): CitableDecision | undefined {
  const kb = loadRAGKnowledgeBase();
  return kb.decisions.find(d => d.decisionId === decisionId);
}

export function getDecisionsByPrecedentTag(tagId: string): CitableDecision[] {
  const kb = loadRAGKnowledgeBase();
  return kb.decisions.filter(d => d.precedentTags.includes(tagId));
}

export function searchPolicies(query: string): CitablePolicy[] {
  const kb = loadRAGKnowledgeBase();
  const lowerQuery = query.toLowerCase();
  return kb.allPolicies.filter(p =>
    p.name.toLowerCase().includes(lowerQuery) ||
    p.description.toLowerCase().includes(lowerQuery) ||
    p.policyId.toLowerCase().includes(lowerQuery) ||
    p.category.toLowerCase().includes(lowerQuery)
  );
}

// ============================================================================
// RAG CONTEXT BUILDERS
// ============================================================================

export function buildFullRAGContext(): string {
  const kb = loadRAGKnowledgeBase();

  const policySummary = kb.allPolicies
    .sort((a, b) => {
      const severityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    })
    .map(p => `- **${p.policyVersionId}**: ${p.name} (${p.severity}) - ${p.source}`)
    .join('\n');

  const procedureSummary = kb.procedures
    .map(p => `- **${p.procedureId}**: ${p.name} → ${p.policyLinks.join(', ')}`)
    .join('\n');

  const controlSummary = kb.controls
    .map(c => `- **${c.controlId}**: ${c.name} [${c.severity}/${c.controlType}]`)
    .join('\n');

  const caseSummary = kb.cases
    .map(c => `- **${c.caseId}**: ${c.summary} (${c.status})`)
    .join('\n');

  const decisionSummary = kb.decisions
    .map(d => `- **${d.decisionId}**: ${d.summary} → ${d.outcome}`)
    .join('\n');

  return `## RAG Knowledge Base Summary
Version: ${kb.version} | Loaded: ${kb.loadedAt}

### Entity Counts
- Total Policies: ${kb.counts.totalPolicies}
  - Template (A-001 to F-003): ${kb.counts.templatePolicies}
  - SPM Governance (SPM-POL-001 to 015): ${kb.counts.spmGovernancePolicies}
  - SCP Legacy: ${kb.counts.scpLegacyPolicies}
- Procedures: ${kb.counts.procedures}
- Controls: ${kb.counts.controls}
- Evidence Items: ${kb.counts.evidence}
- Cases: ${kb.counts.cases}
- Decisions: ${kb.counts.decisions}
- Precedent Tags: ${kb.counts.precedentTags}
- Risk Triggers: ${kb.counts.riskTriggers}
- Jurisdictions: ${kb.counts.jurisdictions}

### Policy Library (by Severity)
${policySummary}

### Procedures
${procedureSummary}

### Controls
${controlSummary}

### Recent Cases
${caseSummary}

### Recent Decisions
${decisionSummary}`;
}

export function buildPolicyCitationContext(policyId: string): string {
  const policy = getPolicyByCode(policyId);
  if (!policy) return `Policy ${policyId} not found in knowledge base.`;

  const controls = getControlsByPolicy(policyId);
  const kb = loadRAGKnowledgeBase();
  const relatedCases = kb.cases.filter(c =>
    c.policyVersionsInScope.some(pv => pv.startsWith(policyId))
  );
  const relatedDecisions = kb.decisions.filter(d =>
    d.policyVersionsInScope.some(pv => pv.startsWith(policyId))
  );

  return `## Policy Citation: ${policy.policyVersionId}

**Name:** ${policy.name}
**Category:** ${policy.category}
**Section:** ${policy.section}
**Severity:** ${policy.severity}
**Effective:** ${policy.effectiveDate}
**Source:** ${policy.source}

**Description:**
${policy.description}

**Required Elements:**
${policy.requiredElements.map(e => `- ${e}`).join('\n')}

${policy.goldStandardLanguage ? `**Gold Standard Language:**
${policy.goldStandardLanguage}` : ''}

**Related Controls (${controls.length}):**
${controls.map(c => `- ${c.controlId}: ${c.name}`).join('\n') || 'None'}

**Related Cases (${relatedCases.length}):**
${relatedCases.map(c => `- ${c.caseId}: ${c.summary}`).join('\n') || 'None'}

**Related Decisions (${relatedDecisions.length}):**
${relatedDecisions.map(d => `- ${d.decisionId}: ${d.summary}`).join('\n') || 'None'}`;
}

export function buildEvidenceCitationContext(evidenceId: string): string {
  const evidence = getEvidenceById(evidenceId);
  if (!evidence) return `Evidence ${evidenceId} not found in knowledge base.`;

  return `## Evidence Citation: ${evidence.evidenceId}

**Type:** ${evidence.type}
**Title:** ${evidence.title}
**Hash:** ${evidence.hash || 'N/A'}

**Metadata:**
${JSON.stringify(evidence.metadata, null, 2)}`;
}

export function buildDecisionCitationContext(decisionId: string): string {
  const decision = getDecisionById(decisionId);
  if (!decision) return `Decision ${decisionId} not found in knowledge base.`;

  return `## Decision Citation: ${decision.decisionId}

**Type:** ${decision.decisionType}
**Body:** ${decision.decisionBody}
**Outcome:** ${decision.outcome}
**Timestamp:** ${decision.timestamp}

**Summary:**
${decision.summary}

**Policies in Scope:**
${decision.policyVersionsInScope.map(p => `- ${p}`).join('\n')}

**Evidence:**
${decision.linkedEvidenceIds.map(e => `- ${e}`).join('\n') || 'None'}

**Precedent Tags:**
${decision.precedentTags.map(t => `- ${t}`).join('\n') || 'None'}

**Conditions:**
${decision.conditions.map(c => `- ${c}`).join('\n') || 'None'}`;
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  RISK_TRIGGERS,
  JURISDICTIONS,
  PATCH_TEMPLATES,
};

export type {
  RiskTrigger,
  Jurisdiction,
  PatchTemplate,
};
