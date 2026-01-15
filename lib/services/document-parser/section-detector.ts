/**
 * Section Detector
 *
 * Detects sections in parsed documents using pattern matching and AI.
 * Splits documents into logical sections for template mapping.
 */

import type { ParsedSection } from '@/lib/contracts/content-json.contract';
import type { ParsedDocumentResult } from './parser-engine';
import { convertToSections, type ConversionOptions } from './json-converter';

/**
 * Section Detection Strategy
 */
export type DetectionStrategy = 'heading' | 'page_break' | 'whitespace' | 'ai' | 'hybrid';

/**
 * Section Detection Options
 */
export interface SectionDetectionOptions extends ConversionOptions {
  /** Detection strategy to use */
  strategy?: DetectionStrategy;

  /** Minimum section size in words */
  minSectionSize?: number;

  /** Maximum section size in words */
  maxSectionSize?: number;

  /** Merge small sections */
  mergeSmallSections?: boolean;

  /** AI confidence threshold (0-1) */
  aiConfidenceThreshold?: number;
}

const DEFAULT_DETECTION_OPTIONS: SectionDetectionOptions = {
  strategy: 'hybrid',
  minSectionSize: 50,
  maxSectionSize: 5000,
  mergeSmallSections: true,
  aiConfidenceThreshold: 0.7,
  sectionDetection: 'heading',
};

/**
 * Section Detector
 */
export class SectionDetector {
  private options: SectionDetectionOptions;

  constructor(options: Partial<SectionDetectionOptions> = {}) {
    this.options = { ...DEFAULT_DETECTION_OPTIONS, ...options };
  }

  /**
   * Detect sections in parsed document
   */
  async detectSections(parsed: ParsedDocumentResult): Promise<ParsedSection[]> {
    let sections: ParsedSection[];

    switch (this.options.strategy) {
      case 'heading':
        sections = this.detectByHeadings(parsed);
        break;

      case 'page_break':
        sections = this.detectByPageBreaks(parsed);
        break;

      case 'whitespace':
        sections = this.detectByWhitespace(parsed);
        break;

      case 'ai':
        sections = await this.detectByAI(parsed);
        break;

      case 'hybrid':
      default:
        sections = await this.detectHybrid(parsed);
        break;
    }

    // Post-processing
    sections = this.postProcessSections(sections);

    return sections;
  }

  /**
   * Detect sections by headings (most common)
   */
  private detectByHeadings(parsed: ParsedDocumentResult): ParsedSection[] {
    return convertToSections(parsed, {
      sectionDetection: 'heading',
      ...this.options,
    });
  }

  /**
   * Detect sections by page breaks
   */
  private detectByPageBreaks(parsed: ParsedDocumentResult): ParsedSection[] {
    // Group elements by page number
    const pageGroups = new Map<number, typeof parsed.elements>();

    parsed.elements.forEach((element) => {
      const page = element.pageNumber || 1;
      if (!pageGroups.has(page)) {
        pageGroups.set(page, []);
      }
      pageGroups.get(page)!.push(element);
    });

    // Convert each page to a section
    const sections: ParsedSection[] = [];

    pageGroups.forEach((elements, page) => {
      // Find heading in page or use page number as title
      const headingElement = elements.find((e) => e.type === 'heading');
      const title = headingElement
        ? (headingElement.content as string)
        : `Section ${page}`;

      sections.push({
        detectedTitle: title,
        blocks: convertToSections(
          { ...parsed, elements },
          { sectionDetection: 'none' }
        )[0].blocks,
        pageRange: { start: page, end: page },
        confidence: 0.8,
        detectionMethod: 'page_break',
      });
    });

    return sections;
  }

  /**
   * Detect sections by whitespace patterns
   */
  private detectByWhitespace(parsed: ParsedDocumentResult): ParsedSection[] {
    // Similar to heading detection but also considers large gaps
    return this.detectByHeadings(parsed);
  }

  /**
   * Detect sections using AI
   */
  private async detectByAI(parsed: ParsedDocumentResult): Promise<ParsedSection[]> {
    // Placeholder for AI-enhanced detection
    // Would call OpenAI/Anthropic API to identify sections
    console.log('[SectionDetector] AI detection not yet implemented, falling back to heading detection');
    return this.detectByHeadings(parsed);
  }

  /**
   * Hybrid detection (combine multiple strategies)
   */
  private async detectHybrid(parsed: ParsedDocumentResult): Promise<ParsedSection[]> {
    // Start with heading detection
    let sections = this.detectByHeadings(parsed);

    // If no sections found, try page break detection
    if (sections.length === 0 && parsed.pageCount && parsed.pageCount > 1) {
      sections = this.detectByPageBreaks(parsed);
    }

    // If still no sections, create single section
    if (sections.length === 0) {
      sections = convertToSections(parsed, { sectionDetection: 'none' });
    }

    return sections;
  }

  /**
   * Post-process sections (merge small, split large, etc.)
   */
  private postProcessSections(sections: ParsedSection[]): ParsedSection[] {
    let processed = [...sections];

    // Merge small sections if enabled
    if (this.options.mergeSmallSections) {
      processed = this.mergeSmallSections(processed);
    }

    // Split large sections
    processed = this.splitLargeSections(processed);

    // Remove empty sections
    processed = processed.filter((s) => s.blocks.length > 0);

    return processed;
  }

  /**
   * Merge consecutive small sections
   */
  private mergeSmallSections(sections: ParsedSection[]): ParsedSection[] {
    const merged: ParsedSection[] = [];
    let currentMerge: ParsedSection | null = null;

    sections.forEach((section) => {
      const wordCount = this.countWords(section);

      if (wordCount < this.options.minSectionSize!) {
        if (currentMerge) {
          // Merge into current
          currentMerge.blocks.push(...section.blocks);
          currentMerge.detectedTitle += ` / ${section.detectedTitle}`;
          if (section.pageRange && currentMerge.pageRange) {
            currentMerge.pageRange.end = Math.max(
              currentMerge.pageRange.end,
              section.pageRange.end
            );
          }
        } else {
          // Start new merge
          currentMerge = { ...section };
        }
      } else {
        // Save current merge if exists
        if (currentMerge) {
          merged.push(currentMerge);
          currentMerge = null;
        }
        // Add this section
        merged.push(section);
      }
    });

    // Save final merge
    if (currentMerge) {
      merged.push(currentMerge);
    }

    return merged;
  }

  /**
   * Split sections that are too large
   */
  private splitLargeSections(sections: ParsedSection[]): ParsedSection[] {
    const split: ParsedSection[] = [];

    sections.forEach((section) => {
      const wordCount = this.countWords(section);

      if (wordCount > this.options.maxSectionSize!) {
        // Split into smaller sections by sub-headings
        const subsections = this.splitBySubheadings(section);
        split.push(...subsections);
      } else {
        split.push(section);
      }
    });

    return split;
  }

  /**
   * Split section by sub-headings
   */
  private splitBySubheadings(section: ParsedSection): ParsedSection[] {
    const subsections: ParsedSection[] = [];
    let currentSubsection: ParsedSection | null = null;

    section.blocks.forEach((block) => {
      if (block.type === 'heading' && (block.level === 3 || block.level === 4)) {
        // Save previous subsection
        if (currentSubsection && currentSubsection.blocks.length > 0) {
          subsections.push(currentSubsection);
        }

        // Start new subsection
        currentSubsection = {
          detectedTitle: block.content,
          blocks: [block],
          pageRange: section.pageRange,
          confidence: section.confidence,
          detectionMethod: section.detectionMethod,
        };
      } else if (currentSubsection) {
        currentSubsection.blocks.push(block);
      } else {
        // No subsection yet, start one
        currentSubsection = {
          detectedTitle: section.detectedTitle,
          blocks: [block],
          pageRange: section.pageRange,
          confidence: section.confidence,
          detectionMethod: section.detectionMethod,
        };
      }
    });

    // Save final subsection - type assertion to work around forEach control flow limitation
    const finalSubsection = currentSubsection as ParsedSection | null;
    if (finalSubsection && finalSubsection.blocks.length > 0) {
      subsections.push(finalSubsection);
    }

    return subsections.length > 0 ? subsections : [section];
  }

  /**
   * Count words in section
   */
  private countWords(section: ParsedSection): number {
    let count = 0;

    section.blocks.forEach((block) => {
      switch (block.type) {
        case 'heading':
        case 'paragraph':
        case 'callout':
          count += block.content.split(/\s+/).filter((w) => w.length > 0).length;
          break;

        case 'list':
          block.items.forEach((item) => {
            count += item.text.split(/\s+/).filter((w) => w.length > 0).length;
          });
          break;

        case 'table':
          count += block.headers.length;
          block.rows.forEach((row) => {
            count += row.cells.filter((c) => c.length > 0).length;
          });
          break;
      }
    });

    return count;
  }
}

/**
 * Convenience function to detect sections
 */
export async function detectSections(
  parsed: ParsedDocumentResult,
  options?: Partial<SectionDetectionOptions>
): Promise<ParsedSection[]> {
  const detector = new SectionDetector(options);
  return detector.detectSections(parsed);
}
