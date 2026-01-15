/**
 * Patch Applicator
 *
 * Applies patch templates to plan sections to remediate governance gaps.
 * Converts patch language to structured JSON content and merges with existing sections.
 */

import type { ContentJSON, Block } from '@/lib/contracts/content-json.contract';
import type { PatchLanguage, Placeholder } from './patch-loader';
import { getPatchForRequirement, getStateNotes } from './patch-loader';

/**
 * Patch Application Options
 */
export interface PatchApplicationOptions {
  /** Policy code (e.g., 'SCP-001') */
  policyCode: string;

  /** Requirement ID (e.g., 'R-001-01') */
  requirementId: string;

  /** Coverage type to use */
  coverage: 'full' | 'partial';

  /** Target section key where patch will be inserted */
  targetSectionKey: string;

  /** Insertion position within the section */
  insertionPosition: 'START' | 'END' | 'REPLACE';

  /** Placeholder values (for customization) */
  placeholderValues?: Record<string, string>;

  /** Jurisdiction for state-specific notes */
  jurisdiction?: string;
}

/**
 * Applied Patch Result
 */
export interface AppliedPatch {
  /** Patch content as JSON blocks */
  contentJson: ContentJSON;

  /** Raw markdown language (for preview) */
  markdown: string;

  /** Placeholders that need values */
  unresolvedPlaceholders: Placeholder[];

  /** State-specific notes (if applicable) */
  stateNotes?: string;

  /** Validation warnings */
  warnings: string[];
}

/**
 * Patch Applicator Service
 */
export class PatchApplicator {
  /**
   * Apply patch to create new content blocks
   */
  async applyPatch(options: PatchApplicationOptions): Promise<AppliedPatch | null> {
    // Load patch template
    const patchLanguage = await getPatchForRequirement(
      options.policyCode,
      options.requirementId,
      options.coverage
    );

    if (!patchLanguage) {
      console.error(
        `No patch template found for ${options.policyCode}/${options.requirementId}`
      );
      return null;
    }

    // Replace placeholders
    const { processedLanguage, unresolvedPlaceholders } = this.replacePlaceholders(
      patchLanguage.language,
      patchLanguage.placeholders || [],
      options.placeholderValues || {}
    );

    // Convert markdown to JSON blocks
    const contentJson = this.markdownToJSON(processedLanguage);

    // Get state-specific notes if jurisdiction provided
    let stateNotes: string | undefined;
    if (options.jurisdiction) {
      stateNotes =
        (await getStateNotes(options.policyCode, options.jurisdiction)) || undefined;
    }

    // Generate warnings
    const warnings = this.generateWarnings(unresolvedPlaceholders, stateNotes);

    return {
      contentJson,
      markdown: processedLanguage,
      unresolvedPlaceholders,
      stateNotes,
      warnings,
    };
  }

  /**
   * Merge patch content with existing section content
   */
  mergePatchWithSection(
    existingContent: ContentJSON,
    patchContent: ContentJSON,
    position: 'START' | 'END' | 'REPLACE'
  ): ContentJSON {
    if (position === 'REPLACE') {
      return patchContent;
    }

    const mergedBlocks =
      position === 'START'
        ? [...patchContent.blocks, ...existingContent.blocks]
        : [...existingContent.blocks, ...patchContent.blocks];

    return {
      ...existingContent,
      blocks: mergedBlocks,
    };
  }

  /**
   * Replace placeholders in language
   */
  private replacePlaceholders(
    language: string,
    placeholders: Placeholder[],
    values: Record<string, string>
  ): { processedLanguage: string; unresolvedPlaceholders: Placeholder[] } {
    let processedLanguage = language;
    const unresolvedPlaceholders: Placeholder[] = [];

    for (const placeholder of placeholders) {
      const value = values[placeholder.name] || placeholder.recommended;

      if (value) {
        // Replace all instances of placeholder
        const regex = new RegExp(this.escapeRegex(placeholder.name), 'g');
        processedLanguage = processedLanguage.replace(regex, value);
      } else if (placeholder.required) {
        unresolvedPlaceholders.push(placeholder);
      }
    }

    return { processedLanguage, unresolvedPlaceholders };
  }

  /**
   * Convert markdown to JSON blocks
   */
  private markdownToJSON(markdown: string): ContentJSON {
    const blocks: Block[] = [];
    const lines = markdown.split('\n');
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];
      const trimmed = line.trim();

      if (trimmed === '') {
        i++;
        continue;
      }

      // Heading: **TEXT** (bold) or ## TEXT
      if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
        blocks.push({
          id: `block-${blocks.length}`,
          type: 'heading',
          level: 2,
          content: trimmed.replace(/^\*\*|\*\*$/g, ''),
        });
      } else if (trimmed.startsWith('##')) {
        const level = trimmed.match(/^#+/)?.[0].length || 2;
        blocks.push({
          id: `block-${blocks.length}`,
          type: 'heading',
          level: level as 1 | 2 | 3 | 4 | 5 | 6,
          content: trimmed.replace(/^#+\s*/, ''),
        });
      }

      // Numbered list
      else if (trimmed.match(/^\d+\./)) {
        const listItems: { text: string }[] = [];
        while (i < lines.length && lines[i].trim().match(/^\d+\./)) {
          const item = lines[i].trim().replace(/^\d+\.\s*/, '');
          listItems.push({ text: item });
          i++;
        }
        blocks.push({
          id: `block-${blocks.length}`,
          type: 'list',
          listType: 'ordered',
          items: listItems,
        });
        continue; // Skip increment
      }

      // Bullet list
      else if (trimmed.startsWith('-')) {
        const listItems: { text: string }[] = [];
        while (i < lines.length && lines[i].trim().startsWith('-')) {
          const item = lines[i].trim().replace(/^-\s*/, '');
          listItems.push({ text: item });
          i++;
        }
        blocks.push({
          id: `block-${blocks.length}`,
          type: 'list',
          listType: 'unordered',
          items: listItems,
        });
        continue; // Skip increment
      }

      // Paragraph
      else {
        blocks.push({
          id: `block-${blocks.length}`,
          type: 'paragraph',
          content: trimmed,
        });
      }

      i++;
    }

    return { version: '1.0', blocks };
  }

  /**
   * Generate warnings for unresolved issues
   */
  private generateWarnings(
    unresolvedPlaceholders: Placeholder[],
    stateNotes?: string
  ): string[] {
    const warnings: string[] = [];

    if (unresolvedPlaceholders.length > 0) {
      warnings.push(
        `Unresolved required placeholders: ${unresolvedPlaceholders.map((p) => p.name).join(', ')}`
      );
    }

    if (stateNotes) {
      warnings.push(`State-specific compliance note: Review jurisdiction requirements`);
    }

    return warnings;
  }

  /**
   * Escape special regex characters
   */
  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}

/**
 * Singleton instance
 */
let _applicator: PatchApplicator | null = null;

export function getPatchApplicator(): PatchApplicator {
  if (!_applicator) {
    _applicator = new PatchApplicator();
  }
  return _applicator;
}

/**
 * Convenience function
 */
export async function applyPatch(
  options: PatchApplicationOptions
): Promise<AppliedPatch | null> {
  return getPatchApplicator().applyPatch(options);
}

/**
 * Preview patch without applying
 */
export async function previewPatch(
  policyCode: string,
  requirementId: string,
  coverage: 'full' | 'partial' = 'full',
  placeholderValues?: Record<string, string>
): Promise<{ markdown: string; warnings: string[] } | null> {
  const result = await applyPatch({
    policyCode,
    requirementId,
    coverage,
    targetSectionKey: 'preview',
    insertionPosition: 'END',
    placeholderValues,
  });

  if (!result) return null;

  return {
    markdown: result.markdown,
    warnings: result.warnings,
  };
}
