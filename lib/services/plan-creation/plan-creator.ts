/**
 * Plan Creator
 *
 * Orchestrates the complete plan creation workflow from document to plan.
 *
 * Workflow:
 * 1. Parse document → Detect sections
 * 2. Map sections → Template sections
 * 3. Analyze gaps → Identify missing policies
 * 4. Generate recommendations → Create insertable content
 * 5. Create plan → Apply mappings and recommendations
 * 6. Calculate completion → Return plan
 */

import type { ParsedSection, ContentJSON } from '@/lib/contracts/content-json.contract';
import type { SectionMapping } from '@/lib/services/section-mapping';
import type { GapAnalysis } from '@/lib/contracts/gap-analysis.contract';
import type { PolicyRecommendation } from '@/lib/contracts/policy-recommendation.contract';
import type { PolicyJSON } from '@/lib/contracts/policy-json.contract';
import { parseAndConvert } from '../document-parser';
import { mapSectionsToTemplate } from '../section-mapping';
import { analyzeGaps } from '../gap-analysis';
import { generateRecommendations } from '../policy-recommendation';
import { mergeContentIntoSection, appendContent } from './json-merger';

/**
 * Plan Creation Result
 */
export interface PlanCreationResult {
  /** Success status */
  success: boolean;

  /** Created plan data */
  plan?: CreatedPlan;

  /** Processing statistics */
  stats: PlanCreationStats;

  /** Errors encountered */
  errors?: string[];

  /** Warnings */
  warnings?: string[];
}

/**
 * Created Plan
 */
export interface CreatedPlan {
  /** Plan ID */
  id: string;

  /** Plan title */
  title: string;

  /** Plan code */
  planCode: string;

  /** Plan sections with content */
  sections: PlanSection[];

  /** Completion percentage */
  completionPercentage: number;

  /** Plan metadata */
  metadata: PlanMetadata;
}

/**
 * Plan Section
 */
export interface PlanSection {
  /** Section ID */
  id: string;

  /** Section key/slug */
  sectionKey: string;

  /** Section title */
  title: string;

  /** Section number */
  sectionNumber: string;

  /** JSON content */
  contentJson: ContentJSON;

  /** Completion status */
  completionStatus: 'EMPTY' | 'PARTIAL' | 'COMPLETE';

  /** Auto-populated flag */
  autoPopulated: boolean;

  /** Source of content */
  contentSource: 'DOCUMENT_MAPPING' | 'POLICY_RECOMMENDATION' | 'MANUAL' | 'MULTIPLE';
}

/**
 * Plan Metadata
 */
export interface PlanMetadata {
  /** Original document path */
  sourceDocument?: string;

  /** Document parse time */
  parseTime: number;

  /** Mapping time */
  mappingTime: number;

  /** Gap analysis time */
  gapAnalysisTime: number;

  /** Recommendation time */
  recommendationTime: number;

  /** Plan creation time */
  creationTime: number;

  /** Total processing time */
  totalProcessingTime: number;

  /** Created timestamp */
  createdAt: Date;
}

/**
 * Plan Creation Stats
 */
export interface PlanCreationStats {
  /** Document sections parsed */
  documentSectionsParsed: number;

  /** Sections mapped */
  sectionsMapped: number;

  /** Auto-accepted mappings */
  autoAcceptedMappings: number;

  /** Gaps detected */
  gapsDetected: number;

  /** Recommendations generated */
  recommendationsGenerated: number;

  /** Recommendations applied */
  recommendationsApplied: number;

  /** Plan sections created */
  planSectionsCreated: number;

  /** Completion percentage */
  completionPercentage: number;

  /** Total processing time (ms) */
  totalProcessingTime: number;
}

/**
 * Plan Creation Options
 */
export interface PlanCreationOptions {
  /** Auto-apply high-confidence mappings */
  autoApplyMappings?: boolean;

  /** Auto-apply high-priority recommendations */
  autoApplyRecommendations?: boolean;

  /** Minimum mapping confidence to auto-apply */
  minAutoApplyConfidence?: number;

  /** Minimum recommendation priority to auto-apply */
  minAutoApplyPriority?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

  /** Gap analysis threshold */
  gapAnalysisThreshold?: number;

  /** Add dividers between merged content */
  addDividersBetweenContent?: boolean;
}

const DEFAULT_OPTIONS: Required<PlanCreationOptions> = {
  autoApplyMappings: true,
  autoApplyRecommendations: false,
  minAutoApplyConfidence: 0.8,
  minAutoApplyPriority: 'CRITICAL',
  gapAnalysisThreshold: 0.3,
  addDividersBetweenContent: true,
};

/**
 * Plan Creator
 */
export class PlanCreator {
  private options: Required<PlanCreationOptions>;

  constructor(options: Partial<PlanCreationOptions> = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  /**
   * Create plan from document
   *
   * @param documentPath - Path to document file
   * @param policies - Policies for gap analysis
   * @param planTitle - Optional plan title
   * @returns Plan creation result
   */
  async createPlanFromDocument(
    documentPath: string,
    policies: PolicyJSON[],
    planTitle?: string
  ): Promise<PlanCreationResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Step 1: Parse document
      console.log('[DOC] Step 1: Parsing document...');
      const parseStartTime = Date.now();

      const parseResult = await parseAndConvert(documentPath, {
        detector: {
          mergeSmallSections: false,
          minSectionSize: 10,
        },
      });

      const parseTime = Date.now() - parseStartTime;
      console.log(
        `[OK] Parsed ${parseResult.sections.length} sections in ${parseTime}ms`
      );

      if (parseResult.sections.length === 0) {
        return {
          success: false,
          stats: this.getEmptyStats(),
          errors: ['No sections found in document'],
        };
      }

      // Step 2: Map sections to template
      console.log('\n🔗 Step 2: Mapping sections to template...');
      const mappingStartTime = Date.now();

      const mappings = await mapSectionsToTemplate(parseResult.sections, {
        autoAcceptThreshold: this.options.minAutoApplyConfidence,
      });

      const mappingTime = Date.now() - mappingStartTime;
      console.log(`[OK] Generated ${mappings.length} mappings in ${mappingTime}ms`);

      // Step 3: Analyze gaps
      console.log('\n🔍 Step 3: Analyzing policy gaps...');
      const gapStartTime = Date.now();

      const gaps = await analyzeGaps(parseResult.sections, policies, {
        keywordMatchThreshold: this.options.gapAnalysisThreshold,
      });

      const gapTime = Date.now() - gapStartTime;
      console.log(`[OK] Detected ${gaps.length} gaps in ${gapTime}ms`);

      // Step 4: Generate recommendations
      console.log('\n[NOTE] Step 4: Generating policy recommendations...');
      const recStartTime = Date.now();

      const recommendations = generateRecommendations(gaps, {
        formatStyle: 'detailed',
      });

      const recTime = Date.now() - recStartTime;
      console.log(
        `[OK] Generated ${recommendations.length} recommendations in ${recTime}ms`
      );

      // Step 5: Create plan
      console.log('\n[DOC] Step 5: Creating plan with content...');
      const creationStartTime = Date.now();

      const plan = await this.buildPlan(
        planTitle || this.extractTitle(documentPath),
        mappings,
        recommendations
      );

      const creationTime = Date.now() - creationStartTime;
      console.log(`[OK] Created plan with ${plan.sections.length} sections`);

      // Build metadata
      const totalTime = Date.now() - startTime;

      const metadata: PlanMetadata = {
        sourceDocument: documentPath,
        parseTime,
        mappingTime,
        gapAnalysisTime: gapTime,
        recommendationTime: recTime,
        creationTime,
        totalProcessingTime: totalTime,
        createdAt: new Date(),
      };

      plan.metadata = metadata;

      // Build stats
      const stats: PlanCreationStats = {
        documentSectionsParsed: parseResult.sections.length,
        sectionsMapped: mappings.filter((m) => m.status === 'ACCEPTED').length,
        autoAcceptedMappings: mappings.filter(
          (m) => m.status === 'ACCEPTED' && m.confidenceScore >= this.options.minAutoApplyConfidence
        ).length,
        gapsDetected: gaps.length,
        recommendationsGenerated: recommendations.length,
        recommendationsApplied: this.options.autoApplyRecommendations
          ? recommendations.filter((r) => r.recommendationDetails.priority === 'CRITICAL')
              .length
          : 0,
        planSectionsCreated: plan.sections.length,
        completionPercentage: plan.completionPercentage,
        totalProcessingTime: totalTime,
      };

      return {
        success: true,
        plan,
        stats,
        errors: errors.length > 0 ? errors : undefined,
        warnings: warnings.length > 0 ? warnings : undefined,
      };
    } catch (error) {
      return {
        success: false,
        stats: this.getEmptyStats(),
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }

  /**
   * Build plan from mappings and recommendations
   */
  private async buildPlan(
    title: string,
    mappings: SectionMapping[],
    recommendations: PolicyRecommendation[]
  ): Promise<CreatedPlan> {
    const sections: PlanSection[] = [];

    // Group mappings by template section
    const mappingsBySection = new Map<string, SectionMapping[]>();

    mappings.forEach((mapping) => {
      const key = mapping.templateSectionId;
      if (!mappingsBySection.has(key)) {
        mappingsBySection.set(key, []);
      }
      mappingsBySection.get(key)!.push(mapping);
    });

    // Group recommendations by target section
    const recsBySection = new Map<string, PolicyRecommendation[]>();

    recommendations.forEach((rec) => {
      const key = rec.recommendationDetails.targetSectionKey;
      if (!recsBySection.has(key)) {
        recsBySection.set(key, []);
      }
      recsBySection.get(key)!.push(rec);
    });

    // Get all unique section keys
    const allSectionKeys = new Set([
      ...Array.from(mappingsBySection.keys()),
      ...Array.from(recsBySection.keys()),
    ]);

    // Create plan sections
    for (const sectionKey of allSectionKeys) {
      const sectionMappings = mappingsBySection.get(sectionKey) || [];
      const sectionRecs = recsBySection.get(sectionKey) || [];

      const section = this.createPlanSection(sectionKey, sectionMappings, sectionRecs);

      sections.push(section);
    }

    // Calculate completion
    const completionPercentage = this.calculateCompletion(sections);

    return {
      id: this.generatePlanId(),
      title,
      planCode: this.generatePlanCode(title),
      sections,
      completionPercentage,
      metadata: {} as PlanMetadata, // Will be set by caller
    };
  }

  /**
   * Create a single plan section
   */
  private createPlanSection(
    sectionKey: string,
    mappings: SectionMapping[],
    recommendations: PolicyRecommendation[]
  ): PlanSection {
    let contentJson: ContentJSON = {
      id: `section-${sectionKey}-${Date.now()}`,
      version: '1.0.0',
      blocks: [],
    };

    let contentSource: PlanSection['contentSource'] = 'MANUAL';
    let autoPopulated = false;

    // Apply accepted mappings
    const acceptedMappings = mappings.filter((m) => m.status === 'ACCEPTED');

    if (acceptedMappings.length > 0) {
      acceptedMappings.forEach((mapping) => {
        const sectionContent: ContentJSON = {
          id: `mapped-${Date.now()}`,
          version: '1.0.0',
          blocks: mapping.parsedSection.blocks,
        };

        contentJson = appendContent(
          contentJson,
          sectionContent,
          this.options.addDividersBetweenContent
        );
      });

      contentSource = 'DOCUMENT_MAPPING';
      autoPopulated = true;
    }

    // Apply high-priority recommendations if enabled
    if (this.options.autoApplyRecommendations) {
      const criticalRecs = recommendations.filter(
        (r) => r.recommendationDetails.priority === this.options.minAutoApplyPriority
      );

      if (criticalRecs.length > 0) {
        criticalRecs.forEach((rec) => {
          contentJson = appendContent(
            contentJson,
            rec.recommendationDetails.contentJson,
            this.options.addDividersBetweenContent
          );
        });

        contentSource =
          contentSource === 'DOCUMENT_MAPPING' ? 'MULTIPLE' : 'POLICY_RECOMMENDATION';
        autoPopulated = true;
      }
    }

    // Determine completion status
    const completionStatus: PlanSection['completionStatus'] =
      contentJson.blocks.length === 0
        ? 'EMPTY'
        : contentJson.blocks.length < 3
        ? 'PARTIAL'
        : 'COMPLETE';

    // Get template section info (use first mapping if available)
    const templateSection =
      mappings.length > 0
        ? mappings[0].templateSection
        : {
            id: sectionKey,
            title: sectionKey,
            sectionNumber: '0.0',
            category: 'Unknown',
            description: '',
          };

    return {
      id: this.generateSectionId(),
      sectionKey,
      title: templateSection.title,
      sectionNumber: templateSection.sectionNumber,
      contentJson,
      completionStatus,
      autoPopulated,
      contentSource,
    };
  }

  /**
   * Calculate plan completion percentage
   */
  private calculateCompletion(sections: PlanSection[]): number {
    if (sections.length === 0) return 0;

    const completed = sections.filter((s) => s.completionStatus === 'COMPLETE').length;
    const partial = sections.filter((s) => s.completionStatus === 'PARTIAL').length;

    // Partial sections count as 0.5
    const totalScore = completed + partial * 0.5;

    return Math.round((totalScore / sections.length) * 100);
  }

  /**
   * Extract title from document path
   */
  private extractTitle(documentPath: string): string {
    const fileName = documentPath.split('/').pop() || 'Untitled';
    return fileName.replace(/\.[^/.]+$/, ''); // Remove extension
  }

  /**
   * Generate plan ID
   */
  private generatePlanId(): string {
    return `plan-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate plan code
   */
  private generatePlanCode(title: string): string {
    const code = title
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '-')
      .substring(0, 20);

    return `${code}-${new Date().getFullYear()}`;
  }

  /**
   * Generate section ID
   */
  private generateSectionId(): string {
    return `section-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get empty stats
   */
  private getEmptyStats(): PlanCreationStats {
    return {
      documentSectionsParsed: 0,
      sectionsMapped: 0,
      autoAcceptedMappings: 0,
      gapsDetected: 0,
      recommendationsGenerated: 0,
      recommendationsApplied: 0,
      planSectionsCreated: 0,
      completionPercentage: 0,
      totalProcessingTime: 0,
    };
  }
}

/**
 * Convenience function to create plan from document
 */
export async function createPlanFromDocument(
  documentPath: string,
  policies: PolicyJSON[],
  options?: Partial<PlanCreationOptions>
): Promise<PlanCreationResult> {
  const creator = new PlanCreator(options);
  return creator.createPlanFromDocument(documentPath, policies);
}
