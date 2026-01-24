/**
 * Convert Governance Implementation Checklist XLSX to JSON
 *
 * Reads the GOVERNANCE_IMPLEMENTATION_CHECKLIST.xlsx file and converts it
 * into the ChecklistContent JSON structure used by the SGM governance framework.
 *
 * Usage:
 *   npx tsx scripts/convert-governance-checklist.ts [input-path]
 *
 * Input: XLSX file with 18 sheets (Summary, Phase 1-12, 5 reference sheets)
 * Output: lib/data/synthetic/governance-checklist.json
 */

import ExcelJS from 'exceljs';
import * as path from 'path';
import * as fs from 'fs';

// Types matching governance-framework.contract.ts
interface ChecklistStep {
  id: string;
  number: number;
  text: string;
}

interface ChecklistItem {
  id: string;
  number: number;
  title: string;
  steps: ChecklistStep[];
}

interface ChecklistPhase {
  id: string;
  number: number;
  title: string;
  type: 'checklist' | 'reference';
  totalSteps: number;
  items: ChecklistItem[];
}

interface ChecklistContent {
  phases: ChecklistPhase[];
}

// Reference sheet metadata (phases 13-17)
const REFERENCE_SHEETS: Record<string, { phaseNumber: number; title: string }> = {
  'Stakeholder Mapping': { phaseNumber: 13, title: 'Stakeholder Mapping' },
  'Job Description': { phaseNumber: 14, title: 'Governance Lead Job Description' },
  'Governance Committee': { phaseNumber: 15, title: 'Governance Committee Charter' },
  'Escalation Paths': { phaseNumber: 16, title: 'Escalation Pathways' },
  'Comp Review Board': { phaseNumber: 17, title: 'Comp Review Board Charter' },
};

/**
 * Extract text from a cell value, handling rich text, formulas, etc.
 */
function extractCellText(cellValue: ExcelJS.CellValue): string {
  if (cellValue === null || cellValue === undefined) return '';

  if (typeof cellValue === 'string') return cellValue.trim();
  if (typeof cellValue === 'number') return String(cellValue);
  if (typeof cellValue === 'boolean') return '';

  // Rich text object
  if (typeof cellValue === 'object' && 'richText' in cellValue) {
    const rt = cellValue as ExcelJS.CellRichTextValue;
    return rt.richText.map((segment) => segment.text).join('').trim();
  }

  // Formula result
  if (typeof cellValue === 'object' && 'formula' in cellValue) {
    const formula = cellValue as ExcelJS.CellFormulaValue;
    if (formula.result !== undefined && formula.result !== null) {
      return typeof formula.result === 'string' ? formula.result.trim() : '';
    }
    return '';
  }

  // Date
  if (cellValue instanceof Date) return '';

  // Hyperlink
  if (typeof cellValue === 'object' && 'hyperlink' in cellValue) {
    const hl = cellValue as ExcelJS.CellHyperlinkValue;
    return typeof hl.text === 'string' ? hl.text.trim() : '';
  }

  return String(cellValue).trim();
}

/**
 * Parse a checklist phase sheet (Phase 1-12).
 * Extracts items and steps following the pattern:
 *   "Item N: title" -> new item
 *   "N. step text" -> step in current item
 */
function parseChecklistPhase(worksheet: ExcelJS.Worksheet, phaseNumber: number): ChecklistPhase {
  let title = '';
  const items: ChecklistItem[] = [];
  let currentItem: ChecklistItem | null = null;

  for (let rowIdx = 1; rowIdx <= worksheet.rowCount; rowIdx++) {
    const row = worksheet.getRow(rowIdx);
    const cellA = extractCellText(row.getCell(1).value);

    if (!cellA) continue;

    // Skip metadata rows
    if (cellA === 'Back to summary' || cellA.startsWith('back to')) continue;
    if (cellA === 'Count of total steps') continue;
    if (cellA === 'Completed?' || cellA === 'Date') continue;

    // Phase title: "PHASE N: TITLE" or "PHASE N: TITLE | Completed? | Date"
    const phaseMatch = cellA.match(/^PHASE\s+\d+:\s+(.+?)(?:\s*\|.*)?$/i);
    if (phaseMatch) {
      title = toTitleCase(phaseMatch[1].trim());
      continue;
    }

    // Item header: "Item N: description"
    const itemMatch = cellA.match(/^Item\s+(\d+):\s+(.+)$/i);
    if (itemMatch) {
      const itemNumber = parseInt(itemMatch[1], 10);
      currentItem = {
        id: `item-${itemNumber}`,
        number: itemNumber,
        title: itemMatch[2].trim(),
        steps: [],
      };
      items.push(currentItem);
      continue;
    }

    // Step: "N. step text" (number followed by period and space)
    const stepMatch = cellA.match(/^(\d+)\.\s+(.+)$/);
    if (stepMatch && currentItem) {
      const stepNumber = parseInt(stepMatch[1], 10);
      currentItem.steps.push({
        id: `step-${phaseNumber}-${currentItem.number}-${stepNumber}`,
        number: stepNumber,
        text: stepMatch[2].trim(),
      });
      continue;
    }
  }

  const totalSteps = items.reduce((sum, item) => sum + item.steps.length, 0);

  return {
    id: `phase-${phaseNumber}`,
    number: phaseNumber,
    title: title || `Phase ${phaseNumber}`,
    type: 'checklist',
    totalSteps,
    items,
  };
}

/**
 * Parse a reference sheet (supplementary content).
 * Groups content into sections based on header patterns.
 */
function parseReferencePhase(
  worksheet: ExcelJS.Worksheet,
  phaseNumber: number,
  title: string
): ChecklistPhase {
  const items: ChecklistItem[] = [];
  let currentItem: ChecklistItem | null = null;
  let stepCounter = 0;
  let itemCounter = 0;

  for (let rowIdx = 1; rowIdx <= worksheet.rowCount; rowIdx++) {
    const row = worksheet.getRow(rowIdx);
    const cellA = extractCellText(row.getCell(1).value);

    if (!cellA) continue;

    // Skip navigation links
    if (cellA.startsWith('back to') || cellA === 'Back to summary') continue;

    // Detect section headers:
    // - ALL CAPS lines (at least 3 chars, no lowercase except articles)
    // - Lines ending with ":"
    // - Lines matching "N. SECTION TITLE" or "N.N Title"
    const isHeader = isSectionHeader(cellA);

    if (isHeader) {
      itemCounter++;
      stepCounter = 0;
      currentItem = {
        id: `ref-${phaseNumber}-item-${itemCounter}`,
        number: itemCounter,
        title: cellA.replace(/:$/, '').trim(),
        steps: [],
      };
      items.push(currentItem);
      continue;
    }

    // Content line - add as step to current item
    if (currentItem) {
      stepCounter++;
      currentItem.steps.push({
        id: `ref-${phaseNumber}-${itemCounter}-${stepCounter}`,
        number: stepCounter,
        text: cellA,
      });
    } else {
      // Content before first header - create a default section
      itemCounter++;
      stepCounter = 1;
      currentItem = {
        id: `ref-${phaseNumber}-item-${itemCounter}`,
        number: itemCounter,
        title: cellA.length > 80 ? cellA.substring(0, 77) + '...' : cellA,
        steps: [],
      };
      items.push(currentItem);
    }
  }

  const totalSteps = items.reduce((sum, item) => sum + item.steps.length, 0);

  return {
    id: `phase-${phaseNumber}`,
    number: phaseNumber,
    title,
    type: 'reference',
    totalSteps,
    items,
  };
}

/**
 * Determine if a line is a section header in reference content.
 */
function isSectionHeader(text: string): boolean {
  // Skip very short lines
  if (text.length < 3) return false;

  // ALL CAPS with at least 3 alpha chars (e.g., "POSITION OVERVIEW", "1. PURPOSE AND MISSION")
  const alphaChars = text.replace(/[^a-zA-Z]/g, '');
  if (alphaChars.length >= 3 && text === text.toUpperCase() && /[A-Z]/.test(text)) {
    return true;
  }

  // Lines ending with ":" that are short enough to be headers (not content)
  if (text.endsWith(':') && text.length <= 80) {
    return true;
  }

  // Numbered section headers: "N. Title" or "N.N Title" where title starts uppercase
  const numberedMatch = text.match(/^(\d+\.(?:\d+)?)\s+([A-Z])/);
  if (numberedMatch && text.length <= 80) {
    return true;
  }

  return false;
}

/**
 * Convert a string to Title Case, preserving common acronyms.
 */
function toTitleCase(str: string): string {
  // Handle ALL CAPS input
  const words = str.toLowerCase().split(/\s+/);
  const smallWords = new Set(['and', 'or', 'the', 'a', 'an', 'in', 'of', 'for', 'to', 'on', 'at', 'by', 'with']);
  // Map lowercase to correct casing for acronyms
  const acronymMap: Record<string, string> = {
    kpis: 'KPIs', kpi: 'KPI', raci: 'RACI', hr: 'HR', it: 'IT',
    sox: 'SOX', spif: 'SPIF', spifs: 'SPIFs', roi: 'ROI',
    erp: 'ERP', crm: 'CRM', api: 'API', apis: 'APIs',
  };

  return words
    .map((word, idx) => {
      if (acronymMap[word]) {
        return acronymMap[word];
      }
      if (idx === 0 || !smallWords.has(word)) {
        return word.charAt(0).toUpperCase() + word.slice(1);
      }
      return word;
    })
    .join(' ');
}

/**
 * Main conversion function.
 */
async function convertGovernanceChecklist(inputPath: string, outputPath: string): Promise<void> {
  console.log(`Reading: ${inputPath}`);

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(inputPath);

  console.log(`Found ${workbook.worksheets.length} sheets\n`);

  const phases: ChecklistPhase[] = [];

  // Process Phase 1-12 (checklist phases)
  for (let phaseNum = 1; phaseNum <= 12; phaseNum++) {
    const sheetName = `Phase ${phaseNum}`;
    const worksheet = workbook.getWorksheet(sheetName);

    if (!worksheet) {
      console.warn(`  WARNING: Sheet "${sheetName}" not found, skipping.`);
      continue;
    }

    const phase = parseChecklistPhase(worksheet, phaseNum);
    phases.push(phase);

    console.log(
      `  Phase ${phaseNum}: "${phase.title}" — ${phase.items.length} items, ${phase.totalSteps} steps`
    );
  }

  // Process reference phases (13-17)
  for (const [sheetName, meta] of Object.entries(REFERENCE_SHEETS)) {
    const worksheet = workbook.getWorksheet(sheetName);

    if (!worksheet) {
      console.warn(`  WARNING: Sheet "${sheetName}" not found, skipping.`);
      continue;
    }

    const phase = parseReferencePhase(worksheet, meta.phaseNumber, meta.title);
    phases.push(phase);

    console.log(
      `  Phase ${meta.phaseNumber} (ref): "${phase.title}" — ${phase.items.length} sections, ${phase.totalSteps} lines`
    );
  }

  const content: ChecklistContent = { phases };

  // Summary
  const totalChecklistPhases = phases.filter((p) => p.type === 'checklist').length;
  const totalReferencePhases = phases.filter((p) => p.type === 'reference').length;
  const totalItems = phases.reduce((sum, p) => sum + p.items.length, 0);
  const totalSteps = phases.reduce((sum, p) => sum + p.totalSteps, 0);
  const checklistSteps = phases
    .filter((p) => p.type === 'checklist')
    .reduce((sum, p) => sum + p.totalSteps, 0);

  console.log('\n--- Summary ---');
  console.log(`  Checklist phases: ${totalChecklistPhases}`);
  console.log(`  Reference phases: ${totalReferencePhases}`);
  console.log(`  Total items/sections: ${totalItems}`);
  console.log(`  Checklist steps: ${checklistSteps}`);
  console.log(`  Reference content lines: ${totalSteps - checklistSteps}`);
  console.log(`  Total steps (all): ${totalSteps}`);

  // Ensure output directory exists
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Write JSON
  fs.writeFileSync(outputPath, JSON.stringify(content, null, 2), 'utf-8');
  console.log(`\nOutput written to: ${outputPath}`);
}

// --- Main ---
const DEFAULT_INPUT = '/Users/toddlebaron/Downloads/GOVERNANCE_IMPLEMENTATION_CHECKLIST.xlsx';
const DEFAULT_OUTPUT = path.resolve(__dirname, '../lib/data/synthetic/governance-checklist.json');

const inputPath = process.argv[2] || DEFAULT_INPUT;
const outputPath = process.argv[3] || DEFAULT_OUTPUT;

convertGovernanceChecklist(inputPath, outputPath).catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
