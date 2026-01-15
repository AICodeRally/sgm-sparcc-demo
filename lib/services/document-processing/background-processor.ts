/**
 * Background Document Processor
 *
 * Handles async processing of uploaded documents:
 * 1. Parse document → Extract text and detect sections
 * 2. Map sections → Match to template sections
 * 3. Analyze gaps → Detect missing policies
 * 4. Generate recommendations → Create policy suggestions
 *
 * Can be triggered via API or background queue.
 */

import { db } from '@/lib/db';
import { parseAndConvert } from '../document-parser';
import { mapSectionsToTemplate } from '../section-mapping';
import { analyzeGaps } from '../gap-analysis';
import { generateRecommendations } from '../policy-recommendation';
import { getAllPoliciesAsJSON } from '@/lib/data/policy-library';
import type { ParsedSection } from '@/lib/contracts/content-json.contract';

export interface ProcessingResult {
  success: boolean;
  documentId: string;
  status: string;
  totalSections?: number;
  totalWords?: number;
  processingTime?: number;
  errorMessage?: string;
}

/**
 * Process uploaded document through complete workflow
 */
export async function processDocument(documentId: string): Promise<ProcessingResult> {
  const startTime = Date.now();

  try {
    // Load document
    const document = await db.uploadedDocument.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      throw new Error(`Document not found: ${documentId}`);
    }

    console.log(`[Processor] Starting processing for document: ${documentId}`);

    // STEP 1: Parse document
    await updateDocumentStatus(documentId, 'PARSING');
    console.log(`[Processor] Step 1: Parsing document...`);

    const parseStartTime = Date.now();
    const parseResult = await parseAndConvert(document.filePath, {
      detector: {
        mergeSmallSections: false,
        minSectionSize: 10,
      },
    });
    const parseTime = Date.now() - parseStartTime;

    console.log(
      `[Processor] Parsed ${parseResult.sections.length} sections in ${parseTime}ms`
    );

    // Count words
    const totalWords = parseResult.sections.reduce((sum, section) => {
      const text = section.blocks
        .map((b) => {
          if (b.type === 'paragraph' || b.type === 'heading') {
            return b.content;
          }
          if (b.type === 'list') {
            return b.items.map((i) => i.text).join(' ');
          }
          return '';
        })
        .join(' ');

      return sum + text.split(/\s+/).filter((w) => w.length > 0).length;
    }, 0);

    // Update document with parsed content
    await db.uploadedDocument.update({
      where: { id: documentId },
      data: {
        status: 'PARSED',
        parsedContent: parseResult as any, // Store ParseResult as JSON
        parsedAt: new Date(),
        totalSections: parseResult.sections.length,
        totalWords,
      },
    });

    // STEP 2: Map sections to template
    await updateDocumentStatus(documentId, 'MAPPING');
    console.log(`[Processor] Step 2: Mapping sections to template...`);

    const mappingStartTime = Date.now();
    const mappings = await mapSectionsToTemplate(parseResult.sections, {
      autoAcceptThreshold: 0.8,
    });
    const mappingTime = Date.now() - mappingStartTime;

    console.log(`[Processor] Generated ${mappings.length} mappings in ${mappingTime}ms`);

    // Store section mappings
    for (const mapping of mappings) {
      await db.sectionMapping.create({
        data: {
          documentId,
          detectedTitle: mapping.parsedSection.detectedTitle || 'Untitled Section',
          detectedContent: {
            blocks: mapping.parsedSection.blocks,
            wordCount: mapping.parsedSection.blocks.length,
          } as any,
          templateSectionId: mapping.templateSectionId,
          templateSectionKey: mapping.templateSection.id,
          templateSectionTitle: mapping.templateSection.title,
          confidenceScore: mapping.confidenceScore,
          mappingMethod: mapping.mappingMethod,
          status: mapping.status,
          alternatives: mapping.alternativeSuggestions as any,
        },
      });
    }

    await updateDocumentStatus(documentId, 'MAPPED');

    // STEP 3: Analyze gaps
    await updateDocumentStatus(documentId, 'ANALYZING');
    console.log(`[Processor] Step 3: Analyzing policy gaps...`);

    const gapStartTime = Date.now();
    const policies = getAllPoliciesAsJSON();
    const gaps = await analyzeGaps(parseResult.sections, policies, {
      keywordMatchThreshold: 0.3,
    });
    const gapTime = Date.now() - gapStartTime;

    console.log(`[Processor] Detected ${gaps.length} gaps in ${gapTime}ms`);

    // STEP 4: Generate recommendations
    console.log(`[Processor] Step 4: Generating policy recommendations...`);

    const recStartTime = Date.now();
    const recommendations = generateRecommendations(gaps, {
      formatStyle: 'detailed',
    });
    const recTime = Date.now() - recStartTime;

    console.log(
      `[Processor] Generated ${recommendations.length} recommendations in ${recTime}ms`
    );

    // Store recommendations
    for (const rec of recommendations) {
      await db.policyRecommendation.create({
        data: {
          documentId,
          planId: null, // Will be set when plan is created
          gapId: rec.gapId || null,
          policyCode: rec.policyCode,
          policyData: rec.policyData as any,
          recommendationDetails: rec.recommendationDetails as any,
          priority: rec.recommendationDetails.priority,
          severity: rec.recommendationDetails.priority, // priority == severity in this context
          status: 'PENDING',
        },
      });
    }

    await updateDocumentStatus(documentId, 'ANALYZED');

    // Mark as ready for review
    await updateDocumentStatus(documentId, 'READY');

    const totalTime = Date.now() - startTime;
    console.log(`[Processor] Processing complete in ${totalTime}ms`);

    // Update processing time
    await db.uploadedDocument.update({
      where: { id: documentId },
      data: {
        processingTime: totalTime,
      },
    });

    return {
      success: true,
      documentId,
      status: 'READY',
      totalSections: parseResult.sections.length,
      totalWords,
      processingTime: totalTime,
    };
  } catch (error) {
    console.error(`[Processor] Error processing document ${documentId}:`, error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // Update document with error
    await db.uploadedDocument.update({
      where: { id: documentId },
      data: {
        status: 'FAILED',
        errorMessage,
        processingTime: Date.now() - startTime,
      },
    });

    return {
      success: false,
      documentId,
      status: 'FAILED',
      errorMessage,
      processingTime: Date.now() - startTime,
    };
  }
}

/**
 * Update document status
 */
async function updateDocumentStatus(documentId: string, status: string): Promise<void> {
  await db.uploadedDocument.update({
    where: { id: documentId },
    data: { status },
  });
}

/**
 * Trigger background processing (async)
 *
 * In production, this would queue a background job.
 * For now, we'll run it asynchronously without blocking.
 */
export function triggerBackgroundProcessing(documentId: string): void {
  // Run async without awaiting
  processDocument(documentId).catch((error) => {
    console.error(`[Processor] Background processing failed for ${documentId}:`, error);
  });
}
