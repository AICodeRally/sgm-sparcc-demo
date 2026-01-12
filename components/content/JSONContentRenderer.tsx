'use client';

/**
 * JSON Content Renderer
 *
 * Renders ContentJSON blocks as clean HTML with zero markdown artifacts.
 *
 * Features:
 * - All block types: heading, paragraph, list, table, callout, divider
 * - Rich text formatting: bold, italic, underline, strikethrough
 * - Clean Tailwind CSS styling
 * - Semantic HTML output
 * - Accessible markup
 *
 * Usage:
 * ```tsx
 * import { JSONContentRenderer } from '@/components/content/JSONContentRenderer';
 *
 * <JSONContentRenderer
 *   content={contentJSON}
 *   className="prose max-w-none"
 * />
 * ```
 */

import React from 'react';
import type {
  ContentJSON,
  Block,
  HeadingBlock,
  ParagraphBlock,
  ListBlock,
  TableBlock,
  CalloutBlock,
  DividerBlock,
} from '@/lib/contracts/content-json.contract';
import {
  ExclamationTriangleIcon,
  InfoCircledIcon,
  CheckCircledIcon,
  CrossCircledIcon,
} from '@radix-ui/react-icons';

interface JSONContentRendererProps {
  /** ContentJSON to render */
  content: ContentJSON | { blocks: Block[] };

  /** Additional CSS classes */
  className?: string;

  /** Show block type indicators (for debugging) */
  showBlockTypes?: boolean;
}

export default function JSONContentRenderer({
  content,
  className = '',
  showBlockTypes = false,
}: JSONContentRendererProps) {
  const blocks = 'blocks' in content ? content.blocks : [];

  return (
    <div className={`json-content-renderer ${className}`}>
      {blocks.map((block, index) => (
        <BlockRenderer
          key={block.id || `block-${index}`}
          block={block}
          showBlockType={showBlockTypes}
        />
      ))}
    </div>
  );
}

/**
 * Block Renderer
 *
 * Renders a single block based on its type.
 */
interface BlockRendererProps {
  block: Block;
  showBlockType?: boolean;
}

function BlockRenderer({ block, showBlockType }: BlockRendererProps) {
  // Optional debug indicator
  const debugLabel = showBlockType && (
    <span className="text-xs text-[color:var(--color-muted)] font-mono mr-2">[{block.type}]</span>
  );

  switch (block.type) {
    case 'heading':
      return <HeadingRenderer block={block} debugLabel={debugLabel} />;

    case 'paragraph':
      return <ParagraphRenderer block={block} debugLabel={debugLabel} />;

    case 'list':
      return <ListRenderer block={block} debugLabel={debugLabel} />;

    case 'table':
      return <TableRenderer block={block} debugLabel={debugLabel} />;

    case 'callout':
      return <CalloutRenderer block={block} debugLabel={debugLabel} />;

    case 'divider':
      return <DividerRenderer block={block} />;

    default:
      return null;
  }
}

/**
 * Heading Renderer
 */
function HeadingRenderer({
  block,
  debugLabel,
}: {
  block: HeadingBlock;
  debugLabel?: React.ReactNode;
}) {
  const HeadingTag = `h${block.level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

  const headingClasses: Record<number, string> = {
    1: 'text-3xl font-bold text-[color:var(--color-foreground)] mb-4 mt-8',
    2: 'text-2xl font-bold text-[color:var(--color-foreground)] mb-3 mt-6',
    3: 'text-xl font-semibold text-[color:var(--color-foreground)] mb-2 mt-5',
    4: 'text-lg font-semibold text-[color:var(--color-foreground)] mb-2 mt-4',
    5: 'text-base font-semibold text-[color:var(--color-foreground)] mb-2 mt-3',
    6: 'text-sm font-semibold text-[color:var(--color-foreground)] mb-1 mt-2',
  };

  return (
    <HeadingTag className={headingClasses[block.level] || headingClasses[2]}>
      {debugLabel}
      <FormattedText content={block.content} formatting={block.formatting} />
    </HeadingTag>
  );
}

/**
 * Paragraph Renderer
 */
function ParagraphRenderer({
  block,
  debugLabel,
}: {
  block: ParagraphBlock;
  debugLabel?: React.ReactNode;
}) {
  return (
    <p className="text-[color:var(--color-foreground)] leading-relaxed mb-4">
      {debugLabel}
      <FormattedText content={block.content} formatting={block.formatting} />
    </p>
  );
}

/**
 * List Renderer
 */
function ListRenderer({
  block,
  debugLabel,
}: {
  block: ListBlock;
  debugLabel?: React.ReactNode;
}) {
  const ListTag = block.listType === 'ordered' ? 'ol' : 'ul';

  const listClasses =
    block.listType === 'ordered'
      ? 'list-decimal list-inside mb-4 space-y-1'
      : 'list-disc list-inside mb-4 space-y-1';

  return (
    <div>
      {debugLabel}
      <ListTag className={listClasses}>
        {block.items.map((item, index) => {
          const indentClass = item.indent
            ? `ml-${Math.min(item.indent * 6, 12)}`
            : '';

          return (
            <li key={index} className={`text-[color:var(--color-foreground)] ${indentClass}`}>
              <FormattedText text={item.text} />
            </li>
          );
        })}
      </ListTag>
    </div>
  );
}

/**
 * Table Renderer
 */
function TableRenderer({
  block,
  debugLabel,
}: {
  block: TableBlock;
  debugLabel?: React.ReactNode;
}) {
  return (
    <div className="mb-4 overflow-x-auto">
      {debugLabel}
      <table className="min-w-full border-collapse border border-[color:var(--color-border)]">
        <thead className="bg-[color:var(--color-surface-alt)]">
          <tr>
            {block.headers.map((header, index) => (
              <th
                key={index}
                className="border border-[color:var(--color-border)] px-4 py-2 text-left text-sm font-semibold text-[color:var(--color-foreground)]"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {block.rows.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className={rowIndex % 2 === 0 ? 'bg-[color:var(--color-surface)]' : 'bg-[color:var(--color-surface-alt)]'}
            >
              {row.cells.map((cell, cellIndex) => (
                <td
                  key={cellIndex}
                  className="border border-[color:var(--color-border)] px-4 py-2 text-sm text-[color:var(--color-foreground)]"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Callout Renderer
 */
function CalloutRenderer({
  block,
  debugLabel,
}: {
  block: CalloutBlock;
  debugLabel?: React.ReactNode;
}) {
  const variantStyles: Record<
    CalloutBlock['variant'],
    { bg: string; border: string; text: string; icon: React.ReactNode }
  > = {
    info: {
      bg: 'bg-[color:var(--color-surface-alt)]',
      border: 'border-[color:var(--color-info-border)]',
      text: 'text-[color:var(--color-info)]',
      icon: <InfoCircledIcon className="w-5 h-5 text-[color:var(--color-info)]" />,
    },
    warning: {
      bg: 'bg-[color:var(--color-warning-bg)]',
      border: 'border-[color:var(--color-warning-border)]',
      text: 'text-[color:var(--color-warning)]',
      icon: <ExclamationTriangleIcon className="w-5 h-5 text-[color:var(--color-warning)]" />,
    },
    error: {
      bg: 'bg-[color:var(--color-error-bg)]',
      border: 'border-[color:var(--color-error-border)]',
      text: 'text-[color:var(--color-error)]',
      icon: <CrossCircledIcon className="w-5 h-5 text-[color:var(--color-error)]" />,
    },
    success: {
      bg: 'bg-[color:var(--color-success-bg)]',
      border: 'border-[color:var(--color-success-border)]',
      text: 'text-[color:var(--color-success)]',
      icon: <CheckCircledIcon className="w-5 h-5 text-[color:var(--color-success)]" />,
    },
  };

  const style = variantStyles[block.variant];

  return (
    <div
      className={`flex gap-3 p-4 mb-4 border-l-4 rounded-r ${style.bg} ${style.border}`}
    >
      <div className="flex-shrink-0 mt-0.5">{style.icon}</div>
      <div className={`flex-1 text-sm ${style.text}`}>
        {debugLabel}
        <FormattedText content={block.content} />
      </div>
    </div>
  );
}

/**
 * Divider Renderer
 */
function DividerRenderer({ block }: { block: DividerBlock }) {
  return <hr className="my-6 border-t border-[color:var(--color-border)]" />;
}

/**
 * Formatted Text Renderer
 *
 * Renders text with formatting (bold, italic, etc.)
 */
interface FormattedTextProps {
  content?: string;
  text?: string;
  formatting?: {
    bold?: [number, number][];
    italic?: [number, number][];
    underline?: [number, number][];
    strikethrough?: [number, number][];
  };
}

function FormattedText({ content, text, formatting }: FormattedTextProps) {
  const textContent = content || text || '';

  // If no formatting, return plain text
  if (!formatting) {
    return <>{textContent}</>;
  }

  // Build segments with formatting
  const segments: Array<{
    text: string;
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strikethrough?: boolean;
  }> = [];

  let currentIndex = 0;

  // Helper to check if index is in range
  const isInRange = (index: number, ranges?: [number, number][]) => {
    if (!ranges) return false;
    return ranges.some(([start, end]) => index >= start && index < end);
  };

  // Split text into segments
  while (currentIndex < textContent.length) {
    const bold = isInRange(currentIndex, formatting.bold);
    const italic = isInRange(currentIndex, formatting.italic);
    const underline = isInRange(currentIndex, formatting.underline);
    const strikethrough = isInRange(currentIndex, formatting.strikethrough);

    // Find end of this formatting segment
    let endIndex = currentIndex + 1;
    while (
      endIndex < textContent.length &&
      isInRange(endIndex, formatting.bold) === bold &&
      isInRange(endIndex, formatting.italic) === italic &&
      isInRange(endIndex, formatting.underline) === underline &&
      isInRange(endIndex, formatting.strikethrough) === strikethrough
    ) {
      endIndex++;
    }

    segments.push({
      text: textContent.substring(currentIndex, endIndex),
      bold,
      italic,
      underline,
      strikethrough,
    });

    currentIndex = endIndex;
  }

  // Render segments
  return (
    <>
      {segments.map((segment, index) => {
        let className = '';
        if (segment.bold) className += 'font-bold ';
        if (segment.italic) className += 'italic ';
        if (segment.underline) className += 'underline ';
        if (segment.strikethrough) className += 'line-through ';

        if (className) {
          return (
            <span key={index} className={className.trim()}>
              {segment.text}
            </span>
          );
        }

        return <React.Fragment key={index}>{segment.text}</React.Fragment>;
      })}
    </>
  );
}

/**
 * Export individual renderers for custom use
 */
export {
  BlockRenderer,
  HeadingRenderer,
  ParagraphRenderer,
  ListRenderer,
  TableRenderer,
  CalloutRenderer,
  DividerRenderer,
  FormattedText,
};
