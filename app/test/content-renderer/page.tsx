'use client';

/**
 * Content Renderer Test Page
 *
 * Demonstrates the JSONContentRenderer component with various content types.
 */

import { useState } from 'react';
import { CheckCircledIcon } from '@radix-ui/react-icons';
import JSONContentRenderer from '@/components/content/JSONContentRenderer';
import type { ContentJSON } from '@/lib/contracts/content-json.contract';

export default function ContentRendererTestPage() {
  const [showBlockTypes, setShowBlockTypes] = useState(false);

  // Sample content with all block types
  const sampleContent: ContentJSON = {
    id: 'test-content-1',
    version: '1.0.0',
    title: 'Sample Compensation Plan Section',
    blocks: [
      {
        id: 'block-1',
        type: 'heading',
        level: 1,
        content: 'Clawback and Recovery Policy',
      },
      {
        id: 'block-2',
        type: 'paragraph',
        content:
          'This policy establishes procedures for recovering commission overpayments made to sales representatives. The policy ensures compliance with federal and state wage laws while protecting the company from financial losses.',
      },
      {
        id: 'block-3',
        type: 'heading',
        level: 2,
        content: 'Purpose and Objectives',
      },
      {
        id: 'block-4',
        type: 'paragraph',
        content: 'The primary objectives of this policy are to:',
      },
      {
        id: 'block-5',
        type: 'list',
        listType: 'ordered',
        items: [
          { text: 'Protect the company from overpayment losses', indent: 0 },
          {
            text: 'Ensure compliance with state wage laws including California Labor Code 201 and New York Labor Law 193',
            indent: 0,
          },
          { text: 'Provide clear process for detecting and recovering overpayments', indent: 0 },
          {
            text: 'Maintain fairness and transparency in compensation administration',
            indent: 0,
          },
        ],
      },
      {
        id: 'block-6',
        type: 'callout',
        variant: 'warning',
        content:
          'IMPORTANT: State wage laws may limit recovery methods. Always consult legal counsel before implementing recovery for terminated employees.',
      },
      {
        id: 'block-7',
        type: 'heading',
        level: 2,
        content: 'Key Provisions',
      },
      {
        id: 'block-8',
        type: 'heading',
        level: 3,
        content: '1. Overpayment Detection',
      },
      {
        id: 'block-9',
        type: 'paragraph',
        content:
          'All overpayments must be detected within 90 days of the payment date. The compensation team conducts monthly audits to identify overpayments resulting from:',
      },
      {
        id: 'block-10',
        type: 'list',
        listType: 'unordered',
        items: [
          { text: 'System errors or calculation mistakes', indent: 0 },
          { text: 'Cancelled or returned orders', indent: 0 },
          { text: 'Credit adjustments', indent: 0 },
          { text: 'Quota or rate changes applied retroactively', indent: 0 },
        ],
      },
      {
        id: 'block-11',
        type: 'heading',
        level: 3,
        content: '2. Recovery Methods and Timeline',
      },
      {
        id: 'block-12',
        type: 'table',
        headers: ['Scenario', 'Recovery Method', 'Timeline', 'Approval Required'],
        rows: [
          {
            cells: [
              'Active employee, < $500',
              'Payroll deduction (single payment)',
              'Next pay period',
              'Manager',
            ],
          },
          {
            cells: [
              'Active employee, $500-$2,000',
              'Payroll deduction (up to 3 payments)',
              '3 pay periods',
              'Director',
            ],
          },
          {
            cells: [
              'Active employee, > $2,000',
              'Offset against future commissions',
              '6-12 months',
              'VP + Legal',
            ],
          },
          {
            cells: ['Terminated employee', 'Invoice + collection', '30 days', 'Legal'],
          },
        ],
      },
      {
        id: 'block-13',
        type: 'callout',
        variant: 'info',
        content:
          'For overpayments exceeding $10,000, a payment plan may be negotiated with approval from the CFO.',
      },
      {
        id: 'block-14',
        type: 'divider',
      },
      {
        id: 'block-15',
        type: 'heading',
        level: 2,
        content: 'Compliance Requirements',
      },
      {
        id: 'block-16',
        type: 'paragraph',
        content: 'This policy ensures compliance with the following regulations:',
      },
      {
        id: 'block-17',
        type: 'list',
        listType: 'unordered',
        items: [
          { text: 'Fair Labor Standards Act (FLSA) Section 7(i)', indent: 0 },
          { text: 'Internal Revenue Code Section 409A', indent: 0 },
          { text: 'California Labor Code 201-203', indent: 0 },
          { text: 'New York Labor Law 193', indent: 0 },
        ],
      },
      {
        id: 'block-18',
        type: 'callout',
        variant: 'success',
        content:
          'This policy has been reviewed and approved by legal counsel and is compliant with all applicable federal and state regulations.',
      },
      {
        id: 'block-19',
        type: 'heading',
        level: 2,
        content: 'Definitions',
      },
      {
        id: 'block-20',
        type: 'list',
        listType: 'unordered',
        items: [
          {
            text: 'Overpayment: Any commission payment that exceeds the amount properly due under the compensation plan',
            indent: 0,
          },
          {
            text: 'Recovery: The process of recouping overpaid commissions through payroll deduction, offset, or collection',
            indent: 0,
          },
          {
            text: 'Payroll Deduction: Direct deduction from employee wages in accordance with state wage laws',
            indent: 0,
          },
          {
            text: 'Offset: Reduction of future commission payments to recover prior overpayments',
            indent: 0,
          },
        ],
      },
      {
        id: 'block-21',
        type: 'callout',
        variant: 'error',
        content:
          'CRITICAL: Never deduct overpayments from base salary without explicit written consent from the employee and legal approval.',
      },
    ],
  };

  // Sample with formatted text
  const formattedTextContent: ContentJSON = {
    id: 'test-content-2',
    version: '1.0.0',
    title: 'Formatted Text Sample',
    blocks: [
      {
        id: 'block-f1',
        type: 'heading',
        level: 2,
        content: 'Text Formatting Examples',
      },
      {
        id: 'block-f2',
        type: 'paragraph',
        content: 'This is a paragraph with bold text in the middle.',
        formatting: {
          bold: [[25, 34]], // "bold text"
        },
      },
      {
        id: 'block-f3',
        type: 'paragraph',
        content: 'This paragraph has italic text and also underlined words.',
        formatting: {
          italic: [[20, 31]], // "italic text"
          underline: [[41, 51]], // "underlined"
        },
      },
      {
        id: 'block-f4',
        type: 'paragraph',
        content: 'You can combine bold and italic formatting together.',
        formatting: {
          bold: [[16, 20], [16, 31]], // "bold" and overlapping
          italic: [[25, 31]], // "italic"
        },
      },
    ],
  };

  return (
    <div className="min-h-screen bg-[color:var(--color-surface-alt)] py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-[color:var(--color-surface)] rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold text-[color:var(--color-foreground)] mb-2">
            JSON Content Renderer Test
          </h1>
          <p className="text-[color:var(--color-muted)]">
            Demonstrating clean HTML rendering from ContentJSON with zero markdown
            artifacts.
          </p>

          {/* Controls */}
          <div className="mt-4 flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showBlockTypes}
                onChange={(e) => setShowBlockTypes(e.target.checked)}
                className="rounded border-[color:var(--color-border)]"
              />
              <span className="text-sm text-[color:var(--color-foreground)]">Show block type indicators</span>
            </label>
          </div>
        </div>

        {/* Sample 1: Full policy section */}
        <div className="bg-[color:var(--color-surface)] rounded-lg shadow-sm p-6 mb-6">
          <div className="mb-4 pb-4 border-b border-[color:var(--color-border)]">
            <h2 className="text-xl font-semibold text-[color:var(--color-foreground)]">
              Sample 1: Complete Policy Section
            </h2>
            <p className="text-sm text-[color:var(--color-muted)] mt-1">
              Demonstrates all block types: headings, paragraphs, lists, table, callouts,
              divider
            </p>
          </div>

          <JSONContentRenderer content={sampleContent} showBlockTypes={showBlockTypes} />
        </div>

        {/* Sample 2: Formatted text */}
        <div className="bg-[color:var(--color-surface)] rounded-lg shadow-sm p-6 mb-6">
          <div className="mb-4 pb-4 border-b border-[color:var(--color-border)]">
            <h2 className="text-xl font-semibold text-[color:var(--color-foreground)]">
              Sample 2: Text Formatting
            </h2>
            <p className="text-sm text-[color:var(--color-muted)] mt-1">
              Demonstrates bold, italic, underline formatting
            </p>
          </div>

          <JSONContentRenderer
            content={formattedTextContent}
            showBlockTypes={showBlockTypes}
          />
        </div>

        {/* Raw JSON view */}
        <div className="bg-[color:var(--color-surface)] rounded-lg shadow-sm p-6">
          <div className="mb-4 pb-4 border-b border-[color:var(--color-border)]">
            <h2 className="text-xl font-semibold text-[color:var(--color-foreground)]">Raw ContentJSON</h2>
            <p className="text-sm text-[color:var(--color-muted)] mt-1">
              The underlying JSON structure being rendered
            </p>
          </div>

          <pre className="bg-[color:var(--color-surface-alt)] p-4 rounded overflow-x-auto text-xs">
            {JSON.stringify(sampleContent, null, 2)}
          </pre>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-[color:var(--color-muted)]">
          <p className="inline-flex items-center gap-2 text-[color:var(--color-success)]">
            <CheckCircledIcon className="w-4 h-4" />
            Zero markdown artifacts • Clean semantic HTML • Accessible markup
          </p>
        </div>
      </div>
    </div>
  );
}
