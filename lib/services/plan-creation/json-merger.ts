/**
 * JSON Content Merger
 *
 * Utilities for merging ContentJSON blocks when applying recommendations.
 */

import type {
  ContentJSON,
  Block,
  ParsedSection,
} from '@/lib/contracts/content-json.contract';
import type { InsertPosition } from '@/lib/contracts/policy-recommendation.contract';

/**
 * Merge Strategy
 */
export type MergeStrategy = 'APPEND' | 'PREPEND' | 'REPLACE' | 'INTERLEAVE';

/**
 * Merge Options
 */
export interface MergeOptions {
  /** Merge strategy */
  strategy?: MergeStrategy;

  /** Insert position (for APPEND/PREPEND) */
  insertPosition?: InsertPosition;

  /** Add divider between merged content */
  addDivider?: boolean;

  /** Preserve existing content metadata */
  preserveMetadata?: boolean;

  /** Deduplicate blocks (remove exact duplicates) */
  deduplicateBlocks?: boolean;
}

const DEFAULT_MERGE_OPTIONS: Required<MergeOptions> = {
  strategy: 'APPEND',
  insertPosition: 'END',
  addDivider: false,
  preserveMetadata: true,
  deduplicateBlocks: true,
};

/**
 * JSON Content Merger
 */
export class JSONContentMerger {
  private options: Required<MergeOptions>;

  constructor(options: Partial<MergeOptions> = {}) {
    this.options = { ...DEFAULT_MERGE_OPTIONS, ...options };
  }

  /**
   * Merge two ContentJSON objects
   *
   * @param existing - Existing content
   * @param newContent - New content to merge
   * @returns Merged ContentJSON
   */
  mergeContent(existing: ContentJSON, newContent: ContentJSON): ContentJSON {
    let mergedBlocks: Block[] = [];

    switch (this.options.strategy) {
      case 'APPEND':
        mergedBlocks = this.appendBlocks(existing.blocks, newContent.blocks);
        break;

      case 'PREPEND':
        mergedBlocks = this.prependBlocks(existing.blocks, newContent.blocks);
        break;

      case 'REPLACE':
        mergedBlocks = [...newContent.blocks];
        break;

      case 'INTERLEAVE':
        mergedBlocks = this.interleaveBlocks(existing.blocks, newContent.blocks);
        break;
    }

    // Deduplicate if enabled
    if (this.options.deduplicateBlocks) {
      mergedBlocks = this.deduplicateBlocks(mergedBlocks);
    }

    // Build merged content
    const merged: ContentJSON = {
      id: existing.id || this.generateContentId(),
      version: existing.version || '1.0.0',
      title: existing.title || newContent.title,
      blocks: mergedBlocks,
      metadata: this.options.preserveMetadata
        ? { ...existing.metadata, ...newContent.metadata }
        : newContent.metadata,
    };

    return merged;
  }

  /**
   * Merge ParsedSection with ContentJSON
   */
  mergeParsedSection(section: ParsedSection, newContent: ContentJSON): ParsedSection {
    const existingContent: ContentJSON = {
      id: `section-${Date.now()}`,
      version: '1.0.0',
      blocks: section.blocks,
    };

    const merged = this.mergeContent(existingContent, newContent);

    return {
      ...section,
      blocks: merged.blocks,
    };
  }

  /**
   * Append blocks to existing content
   */
  private appendBlocks(existing: Block[], newBlocks: Block[]): Block[] {
    const result = [...existing];

    // Add divider if requested
    if (this.options.addDivider && existing.length > 0 && newBlocks.length > 0) {
      result.push({
        id: this.generateBlockId(),
        type: 'divider',
      });
    }

    // Add new blocks based on position
    if (this.options.insertPosition === 'START') {
      return [...newBlocks, ...result];
    } else {
      // END
      return [...result, ...newBlocks];
    }
  }

  /**
   * Prepend blocks to existing content
   */
  private prependBlocks(existing: Block[], newBlocks: Block[]): Block[] {
    const result = [...newBlocks];

    // Add divider if requested
    if (this.options.addDivider && existing.length > 0 && newBlocks.length > 0) {
      result.push({
        id: this.generateBlockId(),
        type: 'divider',
      });
    }

    result.push(...existing);

    return result;
  }

  /**
   * Interleave blocks (alternate between existing and new)
   */
  private interleaveBlocks(existing: Block[], newBlocks: Block[]): Block[] {
    const result: Block[] = [];
    const maxLength = Math.max(existing.length, newBlocks.length);

    for (let i = 0; i < maxLength; i++) {
      if (i < existing.length) {
        result.push(existing[i]);
      }
      if (i < newBlocks.length) {
        result.push(newBlocks[i]);
      }
    }

    return result;
  }

  /**
   * Deduplicate blocks (remove exact duplicates)
   */
  private deduplicateBlocks(blocks: Block[]): Block[] {
    const seen = new Set<string>();
    const unique: Block[] = [];

    blocks.forEach((block) => {
      const signature = this.getBlockSignature(block);

      if (!seen.has(signature)) {
        seen.add(signature);
        unique.push(block);
      }
    });

    return unique;
  }

  /**
   * Get block signature for deduplication
   */
  private getBlockSignature(block: Block): string {
    switch (block.type) {
      case 'heading':
        return `heading:${block.level}:${block.content}`;

      case 'paragraph':
        return `paragraph:${block.content}`;

      case 'list':
        return `list:${block.listType}:${block.items.map((i) => i.text).join('|')}`;

      case 'table':
        return `table:${block.headers.join('|')}:${block.rows.length}`;

      case 'callout':
        return `callout:${block.variant}:${block.content}`;

      case 'divider':
        return `divider:${block.id}`;

      default:
        // TypeScript exhaustiveness check - all Block types should be handled above
        return `unknown:${(block as any).id || 'no-id'}`;
    }
  }

  /**
   * Generate unique content ID
   */
  private generateContentId(): string {
    return `content-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate unique block ID
   */
  private generateBlockId(): string {
    return `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * Merge multiple ContentJSON objects in sequence
 *
 * @param contents - Array of ContentJSON to merge
 * @param options - Merge options
 * @returns Merged ContentJSON
 */
export function mergeMultipleContents(
  contents: ContentJSON[],
  options?: Partial<MergeOptions>
): ContentJSON {
  if (contents.length === 0) {
    return {
      id: `empty-${Date.now()}`,
      version: '1.0.0',
      blocks: [],
    };
  }

  if (contents.length === 1) {
    return contents[0];
  }

  const merger = new JSONContentMerger(options);

  let result = contents[0];

  for (let i = 1; i < contents.length; i++) {
    result = merger.mergeContent(result, contents[i]);
  }

  return result;
}

/**
 * Merge ContentJSON into ParsedSection
 *
 * @param section - Section to merge into
 * @param content - Content to merge
 * @param options - Merge options
 * @returns Updated ParsedSection
 */
export function mergeContentIntoSection(
  section: ParsedSection,
  content: ContentJSON,
  options?: Partial<MergeOptions>
): ParsedSection {
  const merger = new JSONContentMerger(options);
  return merger.mergeParsedSection(section, content);
}

/**
 * Convenience function to append content
 */
export function appendContent(
  existing: ContentJSON,
  newContent: ContentJSON,
  addDivider: boolean = false
): ContentJSON {
  const merger = new JSONContentMerger({
    strategy: 'APPEND',
    insertPosition: 'END',
    addDivider,
  });

  return merger.mergeContent(existing, newContent);
}

/**
 * Convenience function to prepend content
 */
export function prependContent(
  existing: ContentJSON,
  newContent: ContentJSON,
  addDivider: boolean = false
): ContentJSON {
  const merger = new JSONContentMerger({
    strategy: 'PREPEND',
    addDivider,
  });

  return merger.mergeContent(existing, newContent);
}
