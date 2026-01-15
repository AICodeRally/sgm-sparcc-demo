/**
 * JSON Content Generator
 *
 * Converts PolicyJSON into ContentJSON blocks ready for insertion.
 */

import type { PolicyJSON } from '@/lib/contracts/policy-json.contract';
import type {
  ContentJSON,
  Block,
  HeadingBlock,
  ParagraphBlock,
  ListBlock,
  CalloutBlock,
} from '@/lib/contracts/content-json.contract';
import type {
  ContentGenerationTemplate,
  RecommendationOptions,
} from '@/lib/contracts/policy-recommendation.contract';

/**
 * Default template for content generation
 */
const DEFAULT_TEMPLATE: ContentGenerationTemplate = {
  includeHeading: true,
  headingLevel: 2,
  includePurpose: true,
  includeProvisionsList: true,
  includeComplianceCallout: true,
  includeDefinitions: true,
};

/**
 * JSON Content Generator
 */
export class JSONContentGenerator {
  private template: ContentGenerationTemplate;

  constructor(template: Partial<ContentGenerationTemplate> = {}) {
    this.template = { ...DEFAULT_TEMPLATE, ...template };
  }

  /**
   * Generate ContentJSON from PolicyJSON
   *
   * @param policy - Policy to convert
   * @param options - Generation options
   * @returns ContentJSON ready for insertion
   */
  generateContentFromPolicy(
    policy: PolicyJSON,
    options: RecommendationOptions = {}
  ): ContentJSON {
    const blocks: Block[] = [];

    // Determine format style
    const style = options.formatStyle || 'detailed';

    // 1. Heading
    if (this.template.includeHeading) {
      blocks.push(this.createHeading(policy.name, this.template.headingLevel));
    }

    // 2. Purpose section
    if (this.template.includePurpose && options.includeFullContent !== false) {
      if (style === 'detailed') {
        blocks.push(this.createHeading('Purpose', this.template.headingLevel + 1));
      }

      blocks.push(this.createParagraph(policy.purpose.summary));

      if (style === 'detailed' && policy.purpose.objectives.length > 0) {
        blocks.push(
          this.createList(
            'ordered',
            policy.purpose.objectives.map((obj) => ({ text: obj }))
          )
        );
      }
    }

    // 3. Provisions
    if (
      this.template.includeProvisionsList &&
      options.includeProvisions !== false &&
      policy.provisions.length > 0
    ) {
      if (style === 'detailed') {
        blocks.push(
          this.createHeading('Key Provisions', this.template.headingLevel + 1)
        );
      } else if (style === 'summary') {
        blocks.push(this.createParagraph('Key provisions:'));
      }

      // Group provisions by priority
      const criticalProvisions = policy.provisions.filter(
        (p) => p.priority === 'CRITICAL'
      );
      const highProvisions = policy.provisions.filter((p) => p.priority === 'HIGH');
      const otherProvisions = policy.provisions.filter(
        (p) => p.priority !== 'CRITICAL' && p.priority !== 'HIGH'
      );

      if (style === 'minimal') {
        // Only include critical provisions
        if (criticalProvisions.length > 0) {
          blocks.push(
            this.createList(
              'ordered',
              criticalProvisions.map((p) => ({
                text: `${p.title}: ${p.content}`,
              }))
            )
          );
        }
      } else {
        // Include all provisions, organized by priority
        const allProvisions = [
          ...criticalProvisions,
          ...highProvisions,
          ...otherProvisions,
        ];

        blocks.push(
          this.createList(
            'ordered',
            allProvisions.map((p) =>
              style === 'detailed'
                ? { text: `${p.title}: ${p.content}` }
                : { text: p.title }
            )
          )
        );
      }
    }

    // 4. Compliance callout
    if (
      this.template.includeComplianceCallout &&
      options.includeCompliance !== false &&
      (policy.compliance.federalLaws.length > 0 ||
        policy.compliance.stateLaws.length > 0)
    ) {
      const laws = [
        ...policy.compliance.federalLaws,
        ...policy.compliance.stateLaws,
      ];

      blocks.push(
        this.createCallout(
          'info',
          `Compliance: This policy ensures compliance with ${laws.join(', ')}.`
        )
      );
    }

    // 5. Definitions
    if (
      this.template.includeDefinitions &&
      options.includeDefinitions !== false &&
      policy.definitions &&
      policy.definitions.length > 0
    ) {
      if (style === 'detailed') {
        blocks.push(this.createHeading('Definitions', this.template.headingLevel + 1));
      }

      blocks.push(
        this.createList(
          'unordered',
          policy.definitions.map((def) => ({
            text: `${def.term}: ${def.definition}`,
          }))
        )
      );
    }

    // Generate ContentJSON
    const contentJSON: ContentJSON = {
      id: `policy-${policy.code}-${Date.now()}`,
      version: '1.0.0',
      title: policy.name,
      blocks,
      metadata: {
        source: { type: 'policy' as const },
      } as any, // Extended metadata: policyCode, generatedAt, formatStyle
    };

    return contentJSON;
  }

  /**
   * Generate summary content (minimal blocks)
   */
  generateSummaryContent(policy: PolicyJSON): ContentJSON {
    return this.generateContentFromPolicy(policy, {
      formatStyle: 'summary',
      includeProvisions: true,
      includeCompliance: true,
      includeDefinitions: false,
    });
  }

  /**
   * Generate minimal content (policy reference only)
   */
  generateMinimalContent(policy: PolicyJSON): ContentJSON {
    const blocks: Block[] = [
      this.createHeading(policy.name, 3),
      this.createParagraph(policy.purpose.summary),
      this.createParagraph(`See policy ${policy.code} for complete details.`),
    ];

    return {
      id: `policy-${policy.code}-minimal-${Date.now()}`,
      version: '1.0.0',
      title: policy.name,
      blocks,
      metadata: {
        source: { type: 'policy' as const },
      } as any,
    };
  }

  /**
   * Generate compliance-focused content
   */
  generateComplianceContent(policy: PolicyJSON): ContentJSON {
    const blocks: Block[] = [];

    blocks.push(this.createHeading(policy.name, 2));

    // Compliance statement
    if (
      policy.compliance.federalLaws.length > 0 ||
      policy.compliance.stateLaws.length > 0
    ) {
      const laws = [
        ...policy.compliance.federalLaws,
        ...policy.compliance.stateLaws,
      ];

      blocks.push(
        this.createCallout(
          'warning',
          `COMPLIANCE REQUIREMENT: This policy is required for compliance with ${laws.join(
            ', '
          )}.`
        )
      );
    }

    // Critical provisions only
    const criticalProvisions = policy.provisions.filter(
      (p) => p.priority === 'CRITICAL'
    );

    if (criticalProvisions.length > 0) {
      blocks.push(this.createHeading('Critical Requirements', 3));
      blocks.push(
        this.createList(
          'ordered',
          criticalProvisions.map((p) => ({
            text: `${p.title}: ${p.content}`,
          }))
        )
      );
    }

    return {
      id: `policy-${policy.code}-compliance-${Date.now()}`,
      version: '1.0.0',
      title: policy.name,
      blocks,
      metadata: {
        source: { type: 'policy' as const },
      } as any,
    };
  }

  /**
   * Create heading block
   */
  private createHeading(content: string, level: number = 2): HeadingBlock {
    return {
      id: this.generateBlockId(),
      type: 'heading',
      level: Math.min(Math.max(level, 1), 6) as 1 | 2 | 3 | 4 | 5 | 6,
      content,
    };
  }

  /**
   * Create paragraph block
   */
  private createParagraph(content: string): ParagraphBlock {
    return {
      id: this.generateBlockId(),
      type: 'paragraph',
      content,
    };
  }

  /**
   * Create list block
   */
  private createList(
    listType: 'ordered' | 'unordered',
    items: Array<{ text: string; indent?: number }>
  ): ListBlock {
    return {
      id: this.generateBlockId(),
      type: 'list',
      listType,
      items: items.map((item) => ({
        text: item.text,
        indent: item.indent || 0,
      })),
    };
  }

  /**
   * Create callout block
   */
  private createCallout(
    variant: 'info' | 'warning' | 'error' | 'success',
    content: string
  ): CalloutBlock {
    return {
      id: this.generateBlockId(),
      type: 'callout',
      variant,
      content,
    };
  }

  /**
   * Generate unique block ID
   */
  private generateBlockId(): string {
    return `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Extract preview text from ContentJSON
   */
  static extractPreview(contentJSON: ContentJSON, maxLength: number = 200): string {
    let text = '';

    for (const block of contentJSON.blocks) {
      if (text.length >= maxLength) break;

      switch (block.type) {
        case 'heading':
        case 'paragraph':
        case 'callout':
          text += block.content + ' ';
          break;
        case 'list':
          text += block.items.map((i) => i.text).join(' ') + ' ';
          break;
      }
    }

    if (text.length > maxLength) {
      return text.substring(0, maxLength - 3) + '...';
    }

    return text.trim();
  }
}

/**
 * Convenience function to generate content from policy
 */
export function generateContentFromPolicy(
  policy: PolicyJSON,
  options?: RecommendationOptions
): ContentJSON {
  const generator = new JSONContentGenerator();
  return generator.generateContentFromPolicy(policy, options);
}

/**
 * Convenience function to generate preview text
 */
export function generatePreview(contentJSON: ContentJSON, maxLength?: number): string {
  return JSONContentGenerator.extractPreview(contentJSON, maxLength);
}
