/**
 * Governance Gap Analyzer
 *
 * Comprehensive governance analysis with:
 * - A/B/C coverage grading
 * - 1-5 liability scoring
 * - Risk trigger detection
 * - Conflict identification
 *
 * This goes beyond simple "section missing" detection to analyze
 * governance quality and legal risk exposure.
 */

import type { ParsedSection } from '@/lib/contracts/content-json.contract';
import type { PolicyJSON } from '@/lib/contracts/policy-json.contract';
import type {
  GovernanceGapReport,
  GovernanceGapEntry,
  CoverageGrade,
  LiabilityScore,
  RiskTrigger,
  Evidence,
  PolicyRequirement,
  Conflict,
  JurisdictionProfile,
  GapStatistics,
  RiskSummary,
} from '@/lib/contracts/governance-gap.contract';
import { REQUIREMENT_MATRIX } from '@/lib/data/governance/requirement-matrix';
import {
  RISK_TRIGGERS,
  getJurisdictionMultiplier,
  getWageLawFlags,
} from '@/lib/data/governance/risk-triggers';
import { extractTextFromJSON } from '../gap-analysis/json-query';
import { getPatchApplicator } from '../patch-templates/patch-applicator';

/**
 * Governance Analysis Options
 */
export interface GovernanceAnalysisOptions {
  /** Primary jurisdiction (e.g., 'CA', 'NY', 'DEFAULT') */
  jurisdiction?: string;

  /** Minimum confidence for evidence matching */
  minConfidence?: number;

  /** Include plan-only scoring (assume no external policies) */
  planOnlyScoring?: boolean;
}

const DEFAULT_OPTIONS: Required<GovernanceAnalysisOptions> = {
  jurisdiction: 'CA',
  minConfidence: 0.6,
  planOnlyScoring: true,
};

/**
 * Governance Gap Analyzer
 */
export class GovernanceAnalyzer {
  private options: Required<GovernanceAnalysisOptions>;

  constructor(options: Partial<GovernanceAnalysisOptions> = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  /**
   * Analyze plan for governance gaps
   */
  async analyzeGovernance(
    planSections: ParsedSection[],
    policies: PolicyJSON[],
    planId?: string,
    planName?: string
  ): Promise<GovernanceGapReport> {
    // Build plan text for pattern matching
    const planText = this.buildPlanText(planSections);

    // Detect risk triggers
    const detectedTriggers = this.detectRiskTriggers(planText, planSections);

    // Analyze each policy requirement
    const gaps: GovernanceGapEntry[] = [];

    for (const policy of policies) {
      const policyEntry = REQUIREMENT_MATRIX.find((p) => p.policyCode === policy.code);

      if (!policyEntry) {
        console.warn(`No requirement matrix entry for policy: ${policy.code}`);
        continue;
      }

      // Evaluate requirements
      const unmetRequirements: PolicyRequirement[] = [];
      const evidence: Evidence[] = [];
      const conflicts: Conflict[] = [];

      for (const requirement of policyEntry.requirements) {
        const evalResult = this.evaluateRequirement(requirement, planText, planSections);

        if (evalResult.status === 'UNMET' || evalResult.status === 'PARTIAL') {
          unmetRequirements.push({
            ...requirement,
            status: evalResult.status,
            evidence: evalResult.evidence,
          });
        }

        evidence.push(...evalResult.evidenceObjects);
        conflicts.push(...evalResult.conflicts);
      }

      // Calculate coverage grade
      const coverage = this.calculateCoverageGrade(policyEntry.requirements, unmetRequirements);

      // Calculate liability score
      const liability = this.calculateLiabilityScore(
        coverage,
        detectedTriggers.filter((t) => this.isRelevantTrigger(t, policy)),
        this.options.jurisdiction
      );

      // Generate patch recommendation
      const recommendedPatch = await this.generatePatchRecommendation(
        policy,
        unmetRequirements,
        coverage
      );

      // Build gap entry
      const gapEntry: GovernanceGapEntry = {
        id: `gap-${gaps.length + 1}`,
        governanceArea: policyEntry.policyName,
        policyCode: policy.code,
        policy,
        coverage,
        liability,
        riskTriggers: detectedTriggers.filter((t) => this.isRelevantTrigger(t, policy)),
        evidence,
        recommendedPatch,
        unmetRequirements,
        conflicts: conflicts.length > 0 ? conflicts : undefined,
      };

      gaps.push(gapEntry);
    }

    // Build statistics
    const statistics = this.buildStatistics(gaps);

    // Build risk summary
    const riskSummary = this.buildRiskSummary(gaps, detectedTriggers);

    // Build jurisdiction profile
    const jurisdiction: JurisdictionProfile = {
      primaryJurisdiction: this.options.jurisdiction,
      multiplier: getJurisdictionMultiplier(this.options.jurisdiction),
      wageLawFlags: getWageLawFlags(this.options.jurisdiction),
    };

    return {
      planId: planId || `plan-${Date.now()}`,
      planName: planName || 'Untitled Plan',
      analyzedAt: new Date(),
      jurisdiction,
      gaps,
      statistics,
      riskSummary,
    };
  }

  /**
   * Build concatenated plan text for pattern matching
   */
  private buildPlanText(sections: ParsedSection[]): string {
    return sections
      .map((section) => {
        const titleText = section.detectedTitle || '';
        const contentText = extractTextFromJSON({ blocks: section.blocks } as any);
        return `${titleText}\n${contentText}`;
      })
      .join('\n\n');
  }

  /**
   * Detect risk triggers in plan
   */
  private detectRiskTriggers(planText: string, sections: ParsedSection[]): RiskTrigger[] {
    const detected: RiskTrigger[] = [];

    for (const triggerDef of RISK_TRIGGERS) {
      const foundIn: string[] = [];
      const matchedPatterns: string[] = [];

      for (const pattern of triggerDef.patterns) {
        const isNegative = triggerDef.negativeMatch || pattern.startsWith('!');
        const cleanPattern = pattern.replace(/^!/, '');
        const regex = new RegExp(cleanPattern, 'i');

        if (isNegative) {
          // Negative match: trigger if pattern NOT found
          if (!regex.test(planText)) {
            matchedPatterns.push(pattern);
            foundIn.push('(absence detected throughout plan)');
          }
        } else {
          // Positive match: trigger if pattern found
          if (regex.test(planText)) {
            matchedPatterns.push(pattern);

            // Find which sections contain this pattern
            sections.forEach((section) => {
              const sectionText = extractTextFromJSON({ blocks: section.blocks } as any);
              if (regex.test(sectionText)) {
                foundIn.push(section.detectedTitle || 'Untitled Section');
              }
            });
          }
        }
      }

      if (matchedPatterns.length > 0) {
        detected.push({
          id: triggerDef.id,
          name: triggerDef.name,
          description: triggerDef.description,
          patterns: triggerDef.patterns,
          liabilityImpact: triggerDef.liabilityImpact,
          foundIn: [...new Set(foundIn)], // Deduplicate
          matchedPatterns,
        });
      }
    }

    return detected;
  }

  /**
   * Evaluate a single requirement
   */
  private evaluateRequirement(
    requirement: PolicyRequirement,
    planText: string,
    sections: ParsedSection[]
  ): {
    status: 'MET' | 'PARTIAL' | 'UNMET';
    evidence: string[];
    evidenceObjects: Evidence[];
    conflicts: Conflict[];
  } {
    const evidence: string[] = [];
    const evidenceObjects: Evidence[] = [];
    const conflicts: Conflict[] = [];

    let matchedPositive = 0;
    let matchedNegative = 0;
    let matchedElements = 0;

    // Check positive patterns
    if (requirement.detection.positivePatterns) {
      for (const pattern of requirement.detection.positivePatterns) {
        const regex = new RegExp(pattern, 'i');
        if (regex.test(planText)) {
          matchedPositive++;
          evidence.push(`Matched: ${pattern}`);

          // Find exact quote
          const match = planText.match(regex);
          if (match && match.index !== undefined) {
            const start = Math.max(0, match.index - 50);
            const end = Math.min(planText.length, match.index + match[0].length + 50);
            const quote = planText.substring(start, end).trim();

            evidenceObjects.push({
              section: 'Multiple sections',
              lineReference: 'Pattern match',
              quote: `...${quote}...`,
              type: 'SUPPORTS',
              confidence: 0.8,
            });
          }
        }
      }
    }

    // Check negative patterns (should NOT be present)
    if (requirement.detection.negativePatterns) {
      for (const pattern of requirement.detection.negativePatterns) {
        const regex = new RegExp(pattern, 'i');
        if (regex.test(planText)) {
          matchedNegative++;

          // This is a conflict - plan has language that policy prohibits
          conflicts.push({
            id: `conflict-${requirement.id}-${conflicts.length}`,
            planLanguage: pattern,
            policyRequirement: requirement.description,
            type: 'CONTRADICTION',
            severity: requirement.severity,
            evidence: [
              {
                section: 'Multiple sections',
                lineReference: 'Negative pattern match',
                quote: pattern,
                type: 'CONFLICTS',
                confidence: 0.9,
              },
            ],
          });
        }
      }
    }

    // Check required elements (simplified - would need more sophisticated checking)
    if (requirement.detection.requiredElements) {
      const elementCount = Object.keys(requirement.detection.requiredElements).length;
      // Simple heuristic: if positive patterns matched, assume partial element coverage
      matchedElements = matchedPositive > 0 ? Math.floor(elementCount / 2) : 0;
    }

    // Determine status
    let status: 'MET' | 'PARTIAL' | 'UNMET' = 'UNMET';

    const totalRequired =
      (requirement.detection.positivePatterns?.length || 0) +
      Object.keys(requirement.detection.requiredElements || {}).length;

    const totalMatched = matchedPositive + matchedElements;

    if (matchedNegative > 0) {
      // Has conflicts
      status = 'PARTIAL';
    } else if (totalMatched >= totalRequired * 0.8) {
      status = 'MET';
    } else if (totalMatched > 0) {
      status = 'PARTIAL';
    } else {
      status = 'UNMET';
    }

    return { status, evidence, evidenceObjects, conflicts };
  }

  /**
   * Calculate coverage grade
   */
  private calculateCoverageGrade(
    allRequirements: PolicyRequirement[],
    unmetRequirements: PolicyRequirement[]
  ): CoverageGrade {
    const metCount = allRequirements.length - unmetRequirements.length;
    const percentage = metCount / allRequirements.length;

    if (percentage >= 0.8) {
      return 'A'; // 80%+ requirements met
    } else if (percentage >= 0.4) {
      return 'B'; // 40-79% requirements met
    } else {
      return 'C'; // <40% requirements met
    }
  }

  /**
   * Calculate liability score
   */
  private calculateLiabilityScore(
    coverage: CoverageGrade,
    triggers: RiskTrigger[],
    jurisdiction: string
  ): LiabilityScore {
    // Base score from coverage
    let base: number;
    switch (coverage) {
      case 'A':
        base = 1;
        break;
      case 'B':
        base = 2.5;
        break;
      case 'C':
        base = 3.5;
        break;
    }

    // Add trigger impacts
    const triggerImpact = triggers.reduce((sum, t) => sum + t.liabilityImpact, 0);

    // Apply jurisdiction multiplier
    const multiplier = getJurisdictionMultiplier(jurisdiction);

    // Calculate final score
    const raw = (base + triggerImpact) * multiplier;

    // Clamp to 1-5
    const clamped = Math.max(1, Math.min(5, Math.round(raw)));

    return clamped as LiabilityScore;
  }

  /**
   * Check if trigger is relevant to policy
   */
  private isRelevantTrigger(trigger: RiskTrigger, policy: PolicyJSON): boolean {
    // Map triggers to policy categories
    const relevanceMap: Record<string, string[]> = {
      'RT-001': ['Compliance', 'Mid-Period Changes'],
      'RT-002': ['Legal Compliance', 'Compliance'],
      'RT-003': ['Financial Controls', 'Legal Compliance'],
      'RT-004': ['Financial Controls'],
      'RT-005': ['Compliance', 'Dispute Resolution'],
      'RT-006': ['Legal Compliance', 'Compliance'],
      'RT-007': ['Performance Management'],
      'RT-008': ['Financial Controls'],
      'RT-009': ['Performance Management', 'Deal Governance'],
      'RT-010': ['Deal Governance', 'Financial Controls'],
    };

    const relevantCategories = relevanceMap[trigger.id] || [];
    return (
      relevantCategories.includes(policy.category) ||
      relevantCategories.includes(policy.frameworkArea)
    );
  }

  /**
   * Generate patch recommendation
   */
  private async generatePatchRecommendation(
    policy: PolicyJSON,
    unmetRequirements: PolicyRequirement[],
    coverage: CoverageGrade
  ): Promise<any> {
    // Use first unmet requirement's insertion point as target
    const firstUnmet = unmetRequirements[0];

    if (!firstUnmet) {
      return {
        type: 'ENHANCE',
        targetSection: 'Multiple sections',
        insertionPoint: 'Throughout plan',
        policyCode: policy.code,
        contentJson: { blocks: [] },
        rationale: 'Plan meets requirements, consider enhancing documentation',
        priority: 'LOW',
      };
    }

    // Determine patch type and coverage level based on coverage grade
    let patchType: 'INSERT' | 'REPLACE' | 'ENHANCE' | 'REMOVE' = 'INSERT';
    let priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' = 'MEDIUM';
    let coverageLevel: 'full' | 'partial' = 'full';

    if (coverage === 'C') {
      patchType = 'INSERT';
      priority = unmetRequirements.some((r) => r.severity === 'CRITICAL') ? 'CRITICAL' : 'HIGH';
      coverageLevel = 'full';
    } else if (coverage === 'B') {
      patchType = 'ENHANCE';
      priority = unmetRequirements.some((r) => r.severity === 'CRITICAL') ? 'HIGH' : 'MEDIUM';
      coverageLevel = 'partial';
    }

    // Load patch template
    const applicator = getPatchApplicator();
    const patchResult = await applicator.applyPatch({
      policyCode: policy.code,
      requirementId: firstUnmet.id,
      coverage: coverageLevel,
      targetSectionKey: firstUnmet.insertionPoint,
      insertionPosition: patchType === 'INSERT' ? 'END' : 'REPLACE',
      jurisdiction: this.options.jurisdiction,
    });

    // Fallback to basic content if patch template not found
    const contentJson = patchResult
      ? patchResult.contentJson
      : {
          id: `patch-${policy.code}`,
          version: '1.0.0',
          blocks: [
            {
              id: `block-1`,
              type: 'heading',
              level: 2,
              content: policy.name,
            },
            {
              id: `block-2`,
              type: 'paragraph',
              content: policy.purpose.summary,
            },
          ],
        };

    return {
      type: patchType,
      targetSection: firstUnmet.insertionPoint,
      insertionPoint: firstUnmet.insertionPoint,
      policyCode: policy.code,
      contentJson,
      patchLanguage: patchResult?.markdown,
      stateNotes: patchResult?.stateNotes,
      warnings: patchResult?.warnings || [],
      rationale: `Addresses ${unmetRequirements.length} unmet requirements in ${policy.name}`,
      priority,
    };
  }

  /**
   * Build statistics
   */
  private buildStatistics(gaps: GovernanceGapEntry[]): GapStatistics {
    const totalRequirements = gaps.reduce((sum, g) => sum + g.unmetRequirements.length, 0);

    const coverageDistribution = {
      A: gaps.filter((g) => g.coverage === 'A').length,
      B: gaps.filter((g) => g.coverage === 'B').length,
      C: gaps.filter((g) => g.coverage === 'C').length,
    };

    const liabilityDistribution = {
      1: gaps.filter((g) => g.liability === 1).length,
      2: gaps.filter((g) => g.liability === 2).length,
      3: gaps.filter((g) => g.liability === 3).length,
      4: gaps.filter((g) => g.liability === 4).length,
      5: gaps.filter((g) => g.liability === 5).length,
    };

    const severityDistribution = {
      CRITICAL: gaps.reduce(
        (sum, g) => sum + g.unmetRequirements.filter((r) => r.severity === 'CRITICAL').length,
        0
      ),
      HIGH: gaps.reduce(
        (sum, g) => sum + g.unmetRequirements.filter((r) => r.severity === 'HIGH').length,
        0
      ),
      MEDIUM: gaps.reduce(
        (sum, g) => sum + g.unmetRequirements.filter((r) => r.severity === 'MEDIUM').length,
        0
      ),
      LOW: gaps.reduce(
        (sum, g) => sum + g.unmetRequirements.filter((r) => r.severity === 'LOW').length,
        0
      ),
    };

    const totalRiskTriggers = gaps.reduce((sum, g) => sum + g.riskTriggers.length, 0);
    const totalConflicts = gaps.reduce(
      (sum, g) => sum + (g.conflicts?.length || 0),
      0
    );

    return {
      totalRequirements,
      coverageDistribution,
      liabilityDistribution,
      severityDistribution,
      totalRiskTriggers,
      totalConflicts,
    };
  }

  /**
   * Build risk summary
   */
  private buildRiskSummary(gaps: GovernanceGapEntry[], triggers: RiskTrigger[]): RiskSummary {
    // Determine overall risk
    const hasLiability5 = gaps.some((g) => g.liability === 5);
    const hasLiability4 = gaps.some((g) => g.liability === 4);
    const avgLiability =
      gaps.reduce((sum, g) => sum + g.liability, 0) / (gaps.length || 1);

    let overallRisk: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' = 'MEDIUM';
    if (hasLiability5 || avgLiability >= 4) {
      overallRisk = 'CRITICAL';
    } else if (hasLiability4 || avgLiability >= 3) {
      overallRisk = 'HIGH';
    } else if (avgLiability >= 2) {
      overallRisk = 'MEDIUM';
    } else {
      overallRisk = 'LOW';
    }

    // Top risk triggers (sorted by impact)
    const topRiskTriggers = [...triggers]
      .sort((a, b) => b.liabilityImpact - a.liabilityImpact)
      .slice(0, 5);

    // Critical gaps
    const criticalGaps = gaps.filter((g) => g.liability >= 4);

    // High-liability areas
    const highLiabilityAreas = criticalGaps.map((g) => g.governanceArea);

    // Immediate actions
    const immediateActions = criticalGaps
      .slice(0, 5)
      .map((g) => `Address ${g.governanceArea} (${g.policyCode}): ${g.recommendedPatch.rationale}`);

    return {
      overallRisk,
      topRiskTriggers,
      criticalGaps,
      highLiabilityAreas,
      immediateActions,
    };
  }
}

/**
 * Convenience function
 */
export async function analyzeGovernance(
  planSections: ParsedSection[],
  policies: PolicyJSON[],
  options?: Partial<GovernanceAnalysisOptions>
): Promise<GovernanceGapReport> {
  const analyzer = new GovernanceAnalyzer(options);
  return analyzer.analyzeGovernance(planSections, policies);
}
