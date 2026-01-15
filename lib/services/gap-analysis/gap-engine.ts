/**
 * Gap Analysis Engine
 *
 * Detects policy gaps in compensation plans using JSON queries.
 *
 * Algorithm:
 * 1. Load all required policies
 * 2. For each policy, search plan sections for policy keywords
 * 3. If keywords not found, classify as gap
 * 4. Assign severity based on policy category and framework area
 * 5. Generate recommendations for filling gaps
 */

import type { PolicyJSON } from '@/lib/contracts/policy-json.contract';
import type { ParsedSection } from '@/lib/contracts/content-json.contract';
import type {
  GapAnalysis,
  GapAnalysisSummary,
  GapAnalysisOptions,
  GapSeverity,
  MissingElement,
  ImpactAnalysis,
  GapRecommendation,
  KeywordMatchResult,
} from '@/lib/contracts/gap-analysis.contract';
import {
  searchKeywordsInJSON,
  calculateKeywordCoverage,
  findSectionsByKeyword,
  analyzeKeywordDistribution,
} from './json-query';

/**
 * Gap Analysis Engine
 */
export class GapAnalysisEngine {
  private options: Required<GapAnalysisOptions>;

  constructor(options: Partial<GapAnalysisOptions> = {}) {
    this.options = {
      minSeverity: options.minSeverity || 'LOW',
      policyCodesFilter: options.policyCodesFilter || [],
      frameworkAreasFilter: options.frameworkAreasFilter || [],
      includeAcceptedRisks: options.includeAcceptedRisks ?? false,
      keywordMatchThreshold: options.keywordMatchThreshold ?? 0.3,
      enableAIDetection: options.enableAIDetection ?? false,
    };
  }

  /**
   * Analyze gaps in plan sections
   *
   * @param sections - Plan sections to analyze
   * @param policies - Policies to check for
   * @param planCode - Optional plan code
   * @returns Array of detected gaps
   */
  async analyzeGaps(
    sections: ParsedSection[],
    policies: PolicyJSON[],
    planCode?: string
  ): Promise<GapAnalysis[]> {
    const gaps: GapAnalysis[] = [];

    // Filter policies based on options
    const policiesToAnalyze = this.filterPolicies(policies);

    for (const policy of policiesToAnalyze) {
      const gap = await this.analyzePolicyGap(sections, policy, planCode);

      if (gap) {
        // Check if gap severity meets minimum threshold
        if (this.meetsMinimumSeverity(gap.severity)) {
          gaps.push(gap);
        }
      }
    }

    return gaps;
  }

  /**
   * Analyze gap for a specific policy
   */
  private async analyzePolicyGap(
    sections: ParsedSection[],
    policy: PolicyJSON,
    planCode?: string
  ): Promise<GapAnalysis | null> {
    // Extract keywords from policy
    const keywords = this.extractPolicyKeywords(policy);

    // Search all sections for keywords
    const keywordMatches = this.searchSectionsForKeywords(sections, keywords);

    // Calculate coverage
    const coverageScore = this.calculateCoverageScore(keywordMatches);

    // Check if this is a gap (coverage below threshold)
    if (coverageScore >= this.options.keywordMatchThreshold) {
      // Sufficient coverage, not a gap
      return null;
    }

    // This is a gap - generate gap analysis
    const severity = this.determineSeverity(policy, coverageScore);
    const missingElements = this.identifyMissingElements(policy, sections, keywordMatches);
    const impactAnalysis = this.analyzeImpact(policy, sections, severity);
    const recommendations = this.generateRecommendations(policy, sections, severity);

    const gap: GapAnalysis = {
      id: this.generateGapId(),
      planCode,
      policyArea: policy.frameworkArea,
      policyCode: policy.code,
      policy,
      severity,
      status: 'OPEN',
      missingElements,
      impactAnalysis,
      recommendations,
      detectedAt: new Date(),
      searchedKeywords: keywords,
      analyzedSections: sections.map((s) => s.detectedTitle),
    };

    return gap;
  }

  /**
   * Extract keywords from policy
   */
  private extractPolicyKeywords(policy: PolicyJSON): string[] {
    // Start with compliance keywords
    const keywords = [...policy.compliance.keywords];

    // Add key terms from policy name
    const nameTerms = policy.name
      .toLowerCase()
      .split(/[\/\-\s]+/)
      .filter((term) => term.length > 3);
    keywords.push(...nameTerms);

    // Add framework area terms
    const areaTerms = policy.frameworkArea
      .toLowerCase()
      .split(/[\/\-\s]+/)
      .filter((term) => term.length > 3);
    keywords.push(...areaTerms);

    // Deduplicate
    return Array.from(new Set(keywords));
  }

  /**
   * Search sections for keywords
   */
  private searchSectionsForKeywords(
    sections: ParsedSection[],
    keywords: string[]
  ): KeywordMatchResult[] {
    const results: KeywordMatchResult[] = [];

    for (const keyword of keywords) {
      const foundInSections: string[] = [];
      const contexts: string[] = [];
      let matchCount = 0;

      sections.forEach((section) => {
        const searchResults = searchKeywordsInJSON(section, [keyword], {
          caseSensitive: false,
          wholeWord: false,
        });

        const keywordResult = searchResults[0];
        if (keywordResult && keywordResult.found) {
          foundInSections.push(section.detectedTitle);
          matchCount += keywordResult.matches.length;

          // Collect contexts (max 3 per keyword)
          if (contexts.length < 3) {
            keywordResult.matches.forEach((match) => {
              if (contexts.length < 3) {
                contexts.push(match.context);
              }
            });
          }
        }
      });

      results.push({
        keyword,
        found: foundInSections.length > 0,
        foundInSections,
        matchScore: foundInSections.length / sections.length,
        contexts,
      });
    }

    return results;
  }

  /**
   * Calculate overall coverage score
   */
  private calculateCoverageScore(matches: KeywordMatchResult[]): number {
    if (matches.length === 0) return 0;

    const foundCount = matches.filter((m) => m.found).length;
    return foundCount / matches.length;
  }

  /**
   * Determine gap severity
   */
  private determineSeverity(policy: PolicyJSON, coverageScore: number): GapSeverity {
    // Base severity on policy category
    let baseSeverity: GapSeverity = 'MEDIUM';

    // Compliance is critical (legal/regulatory requirements)
    if (policy.category === 'Compliance') {
      baseSeverity = 'CRITICAL';
    } else if (policy.category === 'Financial Controls' || policy.category === 'Payment Processing') {
      // Financial policies are high severity
      baseSeverity = 'HIGH';
    } else if (policy.category === 'Sales Operations' || policy.category === 'Territory Management') {
      // Operations policies are medium severity
      baseSeverity = 'MEDIUM';
    }

    // Adjust based on coverage score
    if (coverageScore === 0) {
      // Complete absence - maintain or increase severity
      return baseSeverity;
    } else if (coverageScore < 0.3) {
      // Partial coverage - maintain severity
      return baseSeverity;
    } else {
      // Some coverage - reduce severity by one level
      const severityLevels: GapSeverity[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
      const currentIndex = severityLevels.indexOf(baseSeverity);
      const newIndex = Math.max(0, currentIndex - 1);
      return severityLevels[newIndex];
    }
  }

  /**
   * Identify missing elements
   */
  private identifyMissingElements(
    policy: PolicyJSON,
    sections: ParsedSection[],
    keywordMatches: KeywordMatchResult[]
  ): MissingElement[] {
    const missingElements: MissingElement[] = [];

    // Check for missing policy reference
    const policyNameFound = keywordMatches.some(
      (m) =>
        m.keyword.toLowerCase() === policy.name.toLowerCase() ||
        m.keyword.toLowerCase() === policy.code.toLowerCase()
    );

    if (!policyNameFound) {
      missingElements.push({
        type: 'policy-reference',
        description: `No reference to ${policy.name} (${policy.code})`,
        expectedContent: `Reference to ${policy.code} or equivalent policy`,
      });
    }

    // Check for missing legal compliance
    if (policy.compliance.federalLaws.length > 0 || policy.compliance.stateLaws.length > 0) {
      const allLaws = [
        ...policy.compliance.federalLaws,
        ...policy.compliance.stateLaws,
      ];

      const lawsFound = allLaws.filter((law) =>
        keywordMatches.some((m) => law.toLowerCase().includes(m.keyword.toLowerCase()))
      );

      if (lawsFound.length === 0) {
        missingElements.push({
          type: 'legal-compliance',
          description: `Missing compliance language for ${allLaws.join(', ')}`,
          expectedContent: `Compliance statement referencing ${allLaws[0]} or equivalent`,
        });
      }
    }

    // Check for missing critical provisions
    const criticalProvisions = policy.provisions.filter(
      (p) => p.priority === 'CRITICAL'
    );

    criticalProvisions.forEach((provision) => {
      // Simple check: look for provision title keywords
      const provisionKeywords = provision.title
        .toLowerCase()
        .split(/\s+/)
        .filter((word) => word.length > 3);

      const provisionFound = provisionKeywords.some((keyword) =>
        keywordMatches.some((m) => m.keyword.toLowerCase().includes(keyword))
      );

      if (!provisionFound) {
        missingElements.push({
          type: 'provision',
          description: `Missing provision: ${provision.title}`,
          expectedContent: provision.content.substring(0, 100) + '...',
          provisionId: provision.id,
        });
      }
    });

    return missingElements;
  }

  /**
   * Analyze impact of gap
   */
  private analyzeImpact(
    policy: PolicyJSON,
    sections: ParsedSection[],
    severity: GapSeverity
  ): ImpactAnalysis {
    const riskFactors: string[] = [];
    let riskScore = 0;

    // Base risk score on severity
    const severityScores: Record<GapSeverity, number> = {
      CRITICAL: 90,
      HIGH: 70,
      MEDIUM: 50,
      LOW: 30,
    };
    riskScore = severityScores[severity];

    // Add risk factors
    if (policy.category === 'Compliance') {
      riskFactors.push('Regulatory compliance risk');
      riskScore = Math.min(100, riskScore + 10);
    }

    if (policy.category === 'Governance') {
      riskFactors.push('Governance and oversight risk');
      riskScore = Math.min(100, riskScore + 5);
    }

    if (
      policy.compliance.federalLaws.length > 0 ||
      policy.compliance.stateLaws.length > 0
    ) {
      riskFactors.push('Legal compliance exposure');
      riskScore = Math.min(100, riskScore + 10);
    }

    // Estimate financial exposure for certain policy types
    let financialExposure: ImpactAnalysis['financialExposure'] | undefined;

    if (policy.code === 'SCP-001') {
      // Clawback policy
      financialExposure = {
        amount: 500000,
        currency: 'USD',
        period: 'annually',
      };
      riskFactors.push('Financial exposure > $500K annually');
    }

    // Determine affected sections (assume all for now)
    const affectedSections = sections.map((s) => s.detectedTitle);

    // Determine compliance risk
    const complianceRisk: 'HIGH' | 'MEDIUM' | 'LOW' =
      severity === 'CRITICAL' || severity === 'HIGH'
        ? 'HIGH'
        : severity === 'MEDIUM'
        ? 'MEDIUM'
        : 'LOW';

    return {
      riskScore,
      riskFactors,
      affectedSections,
      financialExposure,
      complianceRisk,
    };
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(
    policy: PolicyJSON,
    sections: ParsedSection[],
    severity: GapSeverity
  ): GapRecommendation[] {
    const recommendations: GapRecommendation[] = [];

    // Find best target section for this policy
    const targetSectionKey = this.findBestTargetSection(policy, sections);

    // Primary recommendation: INSERT policy content
    recommendations.push({
      policyCode: policy.code,
      action: 'INSERT',
      targetSectionKey,
      priority: severity,
      estimatedEffort: this.estimateEffort(policy),
      rationale: `Address gap in ${policy.frameworkArea} by inserting ${policy.name}`,
    });

    // Secondary recommendation: APPEND to existing section if partial coverage
    if (targetSectionKey !== 'unknown') {
      recommendations.push({
        policyCode: policy.code,
        action: 'APPEND',
        targetSectionKey,
        priority: severity === 'CRITICAL' ? 'HIGH' : 'MEDIUM',
        estimatedEffort: '10 minutes',
        rationale: `Append ${policy.name} provisions to existing section`,
      });
    }

    return recommendations;
  }

  /**
   * Find best target section for policy
   */
  private findBestTargetSection(
    policy: PolicyJSON,
    sections: ParsedSection[]
  ): string {
    // Try to find section with related title
    const relatedSection = sections.find((s) =>
      s.detectedTitle.toLowerCase().includes(policy.frameworkArea.toLowerCase())
    );

    if (relatedSection) {
      return relatedSection.detectedTitle;
    }

    // Default to first section or "unknown"
    return sections.length > 0 ? sections[0].detectedTitle : 'unknown';
  }

  /**
   * Estimate effort to implement policy
   */
  private estimateEffort(policy: PolicyJSON): string {
    const provisionCount = policy.provisions.length;

    if (provisionCount <= 2) return '15 minutes';
    if (provisionCount <= 5) return '30 minutes';
    return '1 hour';
  }

  /**
   * Filter policies based on options
   */
  private filterPolicies(policies: PolicyJSON[]): PolicyJSON[] {
    let filtered = policies;

    // Filter by policy codes
    if (this.options.policyCodesFilter.length > 0) {
      filtered = filtered.filter((p) =>
        this.options.policyCodesFilter.includes(p.code)
      );
    }

    // Filter by framework areas
    if (this.options.frameworkAreasFilter.length > 0) {
      filtered = filtered.filter((p) =>
        this.options.frameworkAreasFilter.includes(p.frameworkArea)
      );
    }

    return filtered;
  }

  /**
   * Check if severity meets minimum threshold
   */
  private meetsMinimumSeverity(severity: GapSeverity): boolean {
    const severityOrder: GapSeverity[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
    const minIndex = severityOrder.indexOf(this.options.minSeverity);
    const gapIndex = severityOrder.indexOf(severity);

    return gapIndex >= minIndex;
  }

  /**
   * Generate unique gap ID
   */
  private generateGapId(): string {
    return `gap-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate summary statistics
   */
  generateSummary(gaps: GapAnalysis[]): GapAnalysisSummary {
    const bySeverity = {
      critical: gaps.filter((g) => g.severity === 'CRITICAL').length,
      high: gaps.filter((g) => g.severity === 'HIGH').length,
      medium: gaps.filter((g) => g.severity === 'MEDIUM').length,
      low: gaps.filter((g) => g.severity === 'LOW').length,
    };

    const byStatus = {
      open: gaps.filter((g) => g.status === 'OPEN').length,
      inProgress: gaps.filter((g) => g.status === 'IN_PROGRESS').length,
      resolved: gaps.filter((g) => g.status === 'RESOLVED').length,
      acceptedRisk: gaps.filter((g) => g.status === 'ACCEPTED_RISK').length,
    };

    const overallRiskScore =
      gaps.length > 0
        ? gaps.reduce((sum, g) => sum + g.impactAnalysis.riskScore, 0) / gaps.length
        : 0;

    const totalFinancialExposure = gaps.reduce((sum, g) => {
      return sum + (g.impactAnalysis.financialExposure?.amount || 0);
    }, 0);

    // Calculate coverage percentage (inverse of gap ratio)
    const coveragePercentage = gaps.length === 0 ? 100 : Math.max(0, 100 - gaps.length * 5);

    // Top risk areas
    const riskAreaMap = new Map<string, { riskScore: number; gapCount: number }>();

    gaps.forEach((gap) => {
      const area = gap.policyArea;
      const existing = riskAreaMap.get(area) || { riskScore: 0, gapCount: 0 };
      existing.riskScore += gap.impactAnalysis.riskScore;
      existing.gapCount += 1;
      riskAreaMap.set(area, existing);
    });

    const topRiskAreas = Array.from(riskAreaMap.entries())
      .map(([area, data]) => ({
        policyArea: area,
        riskScore: data.riskScore / data.gapCount,
        gapCount: data.gapCount,
      }))
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, 5);

    return {
      totalGaps: gaps.length,
      bySeverity,
      byStatus,
      overallRiskScore,
      totalFinancialExposure: totalFinancialExposure > 0 ? totalFinancialExposure : undefined,
      coveragePercentage,
      topRiskAreas,
    };
  }
}

/**
 * Convenience function to analyze gaps
 */
export async function analyzeGaps(
  sections: ParsedSection[],
  policies: PolicyJSON[],
  options?: Partial<GapAnalysisOptions>
): Promise<GapAnalysis[]> {
  const engine = new GapAnalysisEngine(options);
  return engine.analyzeGaps(sections, policies);
}

/**
 * Convenience function to generate summary
 */
export function generateGapSummary(gaps: GapAnalysis[]): GapAnalysisSummary {
  const engine = new GapAnalysisEngine();
  return engine.generateSummary(gaps);
}
