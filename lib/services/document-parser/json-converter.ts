/**
 * JSON Converter
 *
 * Converts extracted document elements to structured ContentJSON format.
 * Eliminates markdown artifacts and creates clean block-based content.
 */

import type {
  Block,
  HeadingBlock,
  ParagraphBlock,
  ListBlock,
  TableBlock,
  ListItem,
  TableRow,
  ContentJSON,
  ParsedSection,
} from '@/lib/contracts/content-json.contract';

import {
  createHeadingBlock,
  createParagraphBlock,
  createListBlock,
  createTableBlock,
  generateBlockId,
  countWordsInBlocks,
} from '@/lib/contracts/content-json.contract';

import type { ExtractedElement, ParsedDocumentResult } from './parser-engine';

/**
 * Conversion Options
 */
export interface ConversionOptions {
  /** Detect and convert bullet lists */
  detectLists?: boolean;

  /** Detect and preserve tables */
  detectTables?: boolean;

  /** Minimum heading length to be considered a heading */
  minHeadingLength?: number;

  /** Maximum heading length to be considered a heading */
  maxHeadingLength?: number;

  /** Section detection strategy */
  sectionDetection?: 'heading' | 'page_break' | 'both' | 'none';
}

const DEFAULT_CONVERSION_OPTIONS: ConversionOptions = {
  detectLists: true,
  detectTables: true,
  minHeadingLength: 3,
  maxHeadingLength: 200,
  sectionDetection: 'heading',
};

/**
 * JSON Converter
 */
export class JSONConverter {
  private options: ConversionOptions;

  constructor(options: Partial<ConversionOptions> = {}) {
    this.options = { ...DEFAULT_CONVERSION_OPTIONS, ...options };
  }

  /**
   * Convert parsed document to ContentJSON
   */
  convertToContentJSON(parsed: ParsedDocumentResult): ContentJSON {
    const blocks: Block[] = [];

    parsed.elements.forEach((element) => {
      const convertedBlocks = this.convertElement(element);
      blocks.push(...convertedBlocks);
    });

    return {
      version: '1.0.0',
      title: parsed.fileName,
      blocks,
      metadata: {
        wordCount: countWordsInBlocks(blocks),
        source: {
          type: 'upload',
          fileName: parsed.fileName,
        },
      },
    };
  }

  /**
   * Convert parsed document to sections
   */
  convertToSections(parsed: ParsedDocumentResult): ParsedSection[] {
    if (this.options.sectionDetection === 'none') {
      // Return entire document as single section
      const blocks = this.convertElements(parsed.elements);
      return [
        {
          detectedTitle: parsed.fileName,
          blocks,
          confidence: 1.0,
          detectionMethod: 'heading',
        },
      ];
    }

    type SectionAccumulator = {
      title: string;
      elements: ExtractedElement[];
      startPage?: number;
      endPage?: number;
    };
    const sections: ParsedSection[] = [];
    let currentSection: SectionAccumulator | null = null;

    parsed.elements.forEach((element, index) => {
      // Detect section breaks
      const isSectionBreak =
        element.type === 'heading' &&
        element.level &&
        element.level <= 2 &&
        this.isValidSectionTitle(element.content as string);

      if (isSectionBreak) {
        // Save previous section
        if (currentSection && currentSection.elements.length > 0) {
          sections.push({
            detectedTitle: currentSection.title,
            blocks: this.convertElements(currentSection.elements),
            pageRange:
              currentSection.startPage !== undefined
                ? { start: currentSection.startPage, end: currentSection.endPage || currentSection.startPage }
                : undefined,
            confidence: 0.9,
            detectionMethod: 'heading',
          });
        }

        // Start new section
        currentSection = {
          title: element.content as string,
          elements: [],
          startPage: element.pageNumber,
          endPage: element.pageNumber,
        };
      } else if (currentSection) {
        // Add to current section
        currentSection.elements.push(element);
        if (element.pageNumber !== undefined) {
          currentSection.endPage = Math.max(
            currentSection.endPage || 0,
            element.pageNumber
          );
        }
      } else {
        // No section yet, start one with document title
        currentSection = {
          title: 'Introduction',
          elements: [element],
          startPage: element.pageNumber,
          endPage: element.pageNumber,
        };
      }
    });

    // Save last section - type assertion to work around forEach control flow limitation
    const finalSection = currentSection as SectionAccumulator | null;
    if (finalSection && finalSection.elements.length > 0) {
      sections.push({
        detectedTitle: finalSection.title,
        blocks: this.convertElements(finalSection.elements),
        pageRange:
          finalSection.startPage !== undefined
            ? { start: finalSection.startPage, end: finalSection.endPage || finalSection.startPage }
            : undefined,
        confidence: 0.9,
        detectionMethod: 'heading',
      });
    }

    return sections;
  }

  /**
   * Convert array of elements to blocks
   */
  private convertElements(elements: ExtractedElement[]): Block[] {
    const blocks: Block[] = [];

    elements.forEach((element) => {
      const convertedBlocks = this.convertElement(element);
      blocks.push(...convertedBlocks);
    });

    return blocks;
  }

  /**
   * Convert a single element to one or more blocks
   */
  private convertElement(element: ExtractedElement): Block[] {
    switch (element.type) {
      case 'heading':
        return [this.convertHeading(element)];

      case 'paragraph':
        return this.convertParagraph(element);

      case 'table':
        return [this.convertTable(element)];

      case 'list':
        return [this.convertList(element)];

      default:
        return [];
    }
  }

  /**
   * Convert heading element
   */
  private convertHeading(element: ExtractedElement): HeadingBlock {
    const content = element.content as string;
    const level = (element.level || 2) as 1 | 2 | 3 | 4 | 5 | 6;

    return createHeadingBlock(level, content.trim());
  }

  /**
   * Convert paragraph element
   */
  private convertParagraph(element: ExtractedElement): Block[] {
    const content = element.content as string;
    const trimmed = content.trim();

    if (trimmed.length === 0) {
      return [];
    }

    // Detect if this is actually a list
    if (this.options.detectLists && this.isListParagraph(trimmed)) {
      return [this.convertListParagraph(trimmed)];
    }

    return [createParagraphBlock(trimmed)];
  }

  /**
   * Convert table element
   */
  private convertTable(element: ExtractedElement): TableBlock {
    const tableData = element.content as string[][];

    if (tableData.length === 0) {
      // Empty table, return as heading
      return createHeadingBlock(3, '[Empty Table]') as any;
    }

    const headers = tableData[0];
    const rows: TableRow[] = tableData.slice(1).map((rowData) => ({
      cells: rowData,
    }));

    return createTableBlock(headers, rows);
  }

  /**
   * Convert list element
   */
  private convertList(element: ExtractedElement): ListBlock {
    const items = (element.content as string[]).map((item) => ({
      text: item.trim(),
    }));

    return createListBlock('unordered', items);
  }

  /**
   * Check if paragraph is actually a list
   */
  private isListParagraph(text: string): boolean {
    const lines = text.split('\n').filter((l) => l.trim().length > 0);

    if (lines.length < 2) {
      return false;
    }

    // Check if most lines start with bullets or numbers
    const bulletCount = lines.filter((line) =>
      /^\s*[-•*]\s+/.test(line) || /^\s*\d+\.\s+/.test(line)
    ).length;

    return bulletCount / lines.length > 0.5;
  }

  /**
   * Convert list-like paragraph to list block
   */
  private convertListParagraph(text: string): ListBlock {
    const lines = text.split('\n').filter((l) => l.trim().length > 0);

    const items: ListItem[] = lines.map((line) => {
      // Remove bullet/number prefix
      const cleaned = line.replace(/^\s*[-•*]\s+/, '').replace(/^\s*\d+\.\s+/, '');
      return { text: cleaned.trim() };
    });

    // Detect list type
    const hasNumbers = lines.some((line) => /^\s*\d+\.\s+/.test(line));
    const listType = hasNumbers ? 'ordered' : 'unordered';

    return createListBlock(listType, items);
  }

  /**
   * Check if text is a valid section title
   */
  private isValidSectionTitle(text: string): boolean {
    const trimmed = text.trim();

    // Check length
    if (
      trimmed.length < this.options.minHeadingLength! ||
      trimmed.length > this.options.maxHeadingLength!
    ) {
      return false;
    }

    // Should not end with punctuation (except colon)
    if (/[.!?,]$/.test(trimmed) && !/:$/.test(trimmed)) {
      return false;
    }

    // Should not be all numbers
    if (/^\d+$/.test(trimmed)) {
      return false;
    }

    return true;
  }
}

/**
 * Convenience function to convert parsed document to ContentJSON
 */
export function convertToContentJSON(
  parsed: ParsedDocumentResult,
  options?: Partial<ConversionOptions>
): ContentJSON {
  const converter = new JSONConverter(options);
  return converter.convertToContentJSON(parsed);
}

/**
 * Convenience function to convert parsed document to sections
 */
export function convertToSections(
  parsed: ParsedDocumentResult,
  options?: Partial<ConversionOptions>
): ParsedSection[] {
  const converter = new JSONConverter(options);
  return converter.convertToSections(parsed);
}
