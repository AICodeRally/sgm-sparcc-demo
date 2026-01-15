/**
 * Governance Gap Analysis Contracts
 *
 * Comprehensive governance gap detection with:
 * - A/B/C coverage grading
 * - 1-5 liability scoring
 * - Risk trigger detection
 * - Conflict identification
 */

import type { PolicyJSON } from './policy-json.contract';
import type { ContentJSON } from './content-json.contract';

/**
 * Coverage Grade
 */
export type CoverageGrade = 'A' | 'B' | 'C';

/**
 * Liability Score (1-5)
 */
export type LiabilityScore = 1 | 2 | 3 | 4 | 5;

/**
 * Governance Gap Register Entry
 */
export interface GovernanceGapEntry {
  /** Entry number */
  id: string;

  /** Governance area name */
  governanceArea: string;

  /** Policy code (e.g., SCP-001) */
  policyCode: string;

  /** Policy object */
  policy: PolicyJSON;

  /** Coverage grade */
  coverage: CoverageGrade;

  /** Liability score */
  liability: LiabilityScore;

  /** Risk triggers detected */
  riskTriggers: RiskTrigger[];

  /** Evidence from plan */
  evidence: Evidence[];

  /** Recommended patch */
  recommendedPatch: PatchRecommendation;

  /** Requirements not met */
  unmetRequirements: PolicyRequirement[];

  /** Conflicts detected */
  conflicts?: Conflict[];
}

/**
 * Policy Requirement
 */
export interface PolicyRequirement {
  /** Requirement ID (e.g., R-001-01) */
  id: string;

  /** Requirement name */
  name: string;

  /** Description */
  description: string;

  /** Severity */
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

  /** Detection rules */
  detection: DetectionRules;

  /** Scoring rubric */
  scoring: {
    A: string; // What makes it adequate
    B: string; // What makes it deficient
    C: string; // What makes it missing
  };

  /** Where to insert if missing */
  insertionPoint: string;

  /** Current status */
  status: 'MET' | 'PARTIAL' | 'UNMET';

  /** Evidence (if met or partial) */
  evidence?: string[];
}

/**
 * Detection Rules
 */
export interface DetectionRules {
  /** Positive patterns (must be present) */
  positivePatterns?: string[];

  /** Negative patterns (must NOT be present) */
  negativePatterns?: string[];

  /** Required elements */
  requiredElements?: Record<string, any>;

  /** Custom validator function name */
  customValidator?: string;
}

/**
 * Risk Trigger
 */
export interface RiskTrigger {
  /** Trigger ID (e.g., RT-001) */
  id: string;

  /** Trigger name */
  name: string;

  /** Description */
  description: string;

  /** Patterns that trigger this */
  patterns: string[];

  /** Liability impact (+1, +2, etc.) */
  liabilityImpact: number;

  /** Where found in plan */
  foundIn: string[];

  /** Matched patterns */
  matchedPatterns: string[];
}

/**
 * Evidence from Plan
 */
export interface Evidence {
  /** Section reference */
  section: string;

  /** Line/paragraph reference */
  lineReference: string;

  /** Quoted text */
  quote: string;

  /** Evidence type */
  type: 'SUPPORTS' | 'PARTIAL' | 'CONFLICTS' | 'MISSING';

  /** Confidence score */
  confidence: number;
}

/**
 * Conflict
 */
export interface Conflict {
  /** Conflict ID */
  id: string;

  /** What plan says */
  planLanguage: string;

  /** What policy requires */
  policyRequirement: string;

  /** Conflict type */
  type: 'CONTRADICTION' | 'MISALIGNMENT' | 'EXCESS_DISCRETION' | 'MISSING_CONTROL';

  /** Severity */
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

  /** Evidence */
  evidence: Evidence[];
}

/**
 * Patch Recommendation
 */
export interface PatchRecommendation {
  /** Patch type */
  type: 'INSERT' | 'REPLACE' | 'ENHANCE' | 'REMOVE';

  /** Target section */
  targetSection: string;

  /** Insertion point */
  insertionPoint: string;

  /** Policy to incorporate */
  policyCode: string;

  /** Content to add (JSON format) */
  contentJson: ContentJSON;

  /** Rationale */
  rationale: string;

  /** Priority */
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
}

/**
 * Jurisdiction Profile
 */
export interface JurisdictionProfile {
  /** Primary jurisdiction */
  primaryJurisdiction: string;

  /** Multiplier for liability scoring */
  multiplier: number;

  /** Wage law flags */
  wageLawFlags: string[];

  /** Other jurisdictions */
  otherJurisdictions?: {
    code: string;
    name: string;
    multiplier: number;
  }[];
}

/**
 * Governance Gap Report
 */
export interface GovernanceGapReport {
  /** Plan ID */
  planId: string;

  /** Plan name */
  planName: string;

  /** Analysis timestamp */
  analyzedAt: Date;

  /** Jurisdiction profile */
  jurisdiction: JurisdictionProfile;

  /** Gap entries */
  gaps: GovernanceGapEntry[];

  /** Overall statistics */
  statistics: GapStatistics;

  /** Risk summary */
  riskSummary: RiskSummary;
}

/**
 * Gap Statistics
 */
export interface GapStatistics {
  /** Total requirements checked */
  totalRequirements: number;

  /** Coverage distribution */
  coverageDistribution: {
    A: number;
    B: number;
    C: number;
  };

  /** Liability distribution */
  liabilityDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };

  /** Severity distribution */
  severityDistribution: {
    CRITICAL: number;
    HIGH: number;
    MEDIUM: number;
    LOW: number;
  };

  /** Total risk triggers */
  totalRiskTriggers: number;

  /** Total conflicts */
  totalConflicts: number;
}

/**
 * Risk Summary
 */
export interface RiskSummary {
  /** Overall risk level */
  overallRisk: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

  /** Top risk triggers */
  topRiskTriggers: RiskTrigger[];

  /** Critical gaps */
  criticalGaps: GovernanceGapEntry[];

  /** High-liability areas */
  highLiabilityAreas: string[];

  /** Recommended immediate actions */
  immediateActions: string[];
}

/**
 * Requirement Matrix Entry
 */
export interface RequirementMatrixEntry {
  /** Policy code */
  policyCode: string;

  /** Policy name */
  policyName: string;

  /** Category */
  category: string;

  /** Requirements */
  requirements: PolicyRequirement[];
}

/**
 * Risk Trigger Definition
 */
export interface RiskTriggerDefinition {
  /** Trigger ID */
  id: string;

  /** Trigger name */
  name: string;

  /** Patterns to detect */
  patterns: string[];

  /** Is this a negative match? */
  negativeMatch?: boolean;

  /** Liability impact */
  liabilityImpact: number;

  /** Description */
  description: string;

  /** Category for grouping triggers */
  category?: string;
}

/**
 * Jurisdiction Definition
 */
export interface JurisdictionDefinition {
  /** Jurisdiction code (e.g., 'CA', 'NY', 'FEDERAL') */
  code: string;

  /** Display name */
  name: string;

  /** Description of jurisdiction-specific rules */
  description?: string;

  /** Required policies for this jurisdiction */
  requiredPolicies?: string[];

  /** Special considerations */
  specialConsiderations?: string[];

  /** Multiplier for jurisdiction-specific calculations */
  multiplier?: number;

  /** Wage law flags */
  wageLawFlags?: string[];
}
