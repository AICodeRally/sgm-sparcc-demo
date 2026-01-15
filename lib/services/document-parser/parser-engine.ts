/**
 * Document Parser Engine
 *
 * Extracts text and structure from PDF, DOCX, TXT, and Excel files.
 * Converts to intermediate format for JSON conversion.
 */

import * as fs from 'fs';
import * as path from 'path';
// @ts-ignore - pdf-parse doesn't have perfect types
const pdfParse = require('pdf-parse');
import mammoth from 'mammoth';
import * as XLSX from 'xlsx';

/**
 * File Types
 */
export type FileType = 'pdf' | 'docx' | 'txt' | 'xlsx' | 'csv';

/**
 * Extracted Element Types
 */
export type ExtractedElementType = 'heading' | 'paragraph' | 'table' | 'list';

/**
 * Extracted Element
 *
 * Intermediate representation before JSON conversion.
 */
export interface ExtractedElement {
  type: ExtractedElementType;
  content: string | string[][] | string[];
  level?: number; // For headings (1-6)
  pageNumber?: number;
  metadata?: Record<string, any>;
}

/**
 * Parsed Document Result
 */
export interface ParsedDocumentResult {
  fileName: string;
  fileType: FileType;
  pageCount?: number;
  elements: ExtractedElement[];
  rawText: string;
  metadata: {
    parseTime: number;
    fileSize: number;
    warnings: string[];
    errors: string[];
  };
}

/**
 * Parser Options
 */
export interface ParserOptions {
  /** Maximum file size in bytes (default: 50MB) */
  maxFileSize?: number;

  /** Extract tables from PDF/DOCX */
  extractTables?: boolean;

  /** Extract headings */
  extractHeadings?: boolean;

  /** Preserve page numbers */
  preservePageNumbers?: boolean;
}

const DEFAULT_OPTIONS: ParserOptions = {
  maxFileSize: 50 * 1024 * 1024, // 50MB
  extractTables: true,
  extractHeadings: true,
  preservePageNumbers: true,
};

/**
 * Main Parser Engine
 */
export class DocumentParser {
  private options: ParserOptions;

  constructor(options: Partial<ParserOptions> = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  /**
   * Parse a document file
   */
  async parseFile(filePath: string): Promise<ParsedDocumentResult> {
    const startTime = Date.now();
    const warnings: string[] = [];
    const errors: string[] = [];

    // Check file exists
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    // Check file size
    const stats = fs.statSync(filePath);
    if (stats.size > this.options.maxFileSize!) {
      throw new Error(
        `File too large: ${stats.size} bytes (max: ${this.options.maxFileSize} bytes)`
      );
    }

    // Determine file type
    const ext = path.extname(filePath).toLowerCase().replace('.', '');
    const fileType = ext as FileType;

    // Validate file type
    if (!['pdf', 'docx', 'txt', 'xlsx', 'csv'].includes(fileType)) {
      throw new Error(`Unsupported file type: ${ext}`);
    }

    let result: ParsedDocumentResult;

    try {
      switch (fileType) {
        case 'pdf':
          result = await this.parsePDF(filePath);
          break;

        case 'docx':
          result = await this.parseDOCX(filePath);
          break;

        case 'txt':
          result = await this.parseTXT(filePath);
          break;

        case 'xlsx':
        case 'csv':
          result = await this.parseExcel(filePath, fileType);
          break;

        default:
          throw new Error(`Unsupported file type: ${fileType}`);
      }

      result.metadata.parseTime = Date.now() - startTime;
      result.metadata.fileSize = stats.size;
      result.metadata.warnings = warnings;
      result.metadata.errors = errors;

      return result;
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error));
      throw new Error(`Failed to parse ${fileType.toUpperCase()}: ${errors.join(', ')}`);
    }
  }

  /**
   * Parse PDF file
   */
  private async parsePDF(filePath: string): Promise<ParsedDocumentResult> {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);

    const elements: ExtractedElement[] = [];
    const warnings: string[] = [];

    // Split text into paragraphs
    const paragraphs = data.text
      .split(/\n\n+/)
      .map((p: string) => p.trim())
      .filter((p: string) => p.length > 0);

    let currentPage = 1;
    const linesPerPage = data.numpages > 0 ? data.text.split('\n').length / data.numpages : 100;

    paragraphs.forEach((para: string, index: number) => {
      // Estimate page number
      const estimatedPage = Math.ceil((index * linesPerPage) / paragraphs.length);

      // Detect headings (ALL CAPS or short lines that look like titles)
      const isHeading =
        para === para.toUpperCase() ||
        (para.length < 100 && !para.endsWith('.') && !para.includes(','));

      if (isHeading && this.options.extractHeadings) {
        elements.push({
          type: 'heading',
          content: para,
          level: para === para.toUpperCase() ? 1 : 2,
          pageNumber: this.options.preservePageNumbers ? estimatedPage : undefined,
        });
      } else {
        elements.push({
          type: 'paragraph',
          content: para,
          pageNumber: this.options.preservePageNumbers ? estimatedPage : undefined,
        });
      }
    });

    if (elements.length === 0) {
      warnings.push('No content extracted from PDF');
    }

    return {
      fileName: path.basename(filePath),
      fileType: 'pdf',
      pageCount: data.numpages,
      elements,
      rawText: data.text,
      metadata: {
        parseTime: 0,
        fileSize: 0,
        warnings,
        errors: [],
      },
    };
  }

  /**
   * Parse DOCX file
   */
  private async parseDOCX(filePath: string): Promise<ParsedDocumentResult> {
    const result = await mammoth.convertToHtml({ path: filePath });
    const warnings: string[] = result.messages.map((m) => m.message);

    // Parse HTML to extract elements
    const elements: ExtractedElement[] = [];
    const html = result.value;

    // Simple HTML parsing (replace with proper parser if needed)
    const headingMatches = html.matchAll(/<h(\d)>(.+?)<\/h\d>/g);
    for (const match of headingMatches) {
      elements.push({
        type: 'heading',
        content: this.stripHTML(match[2]),
        level: parseInt(match[1]) as 1 | 2 | 3 | 4 | 5 | 6,
      });
    }

    const paragraphMatches = html.matchAll(/<p>(.+?)<\/p>/g);
    for (const match of paragraphMatches) {
      const text = this.stripHTML(match[1]).trim();
      if (text.length > 0) {
        elements.push({
          type: 'paragraph',
          content: text,
        });
      }
    }

    // Extract tables if enabled
    if (this.options.extractTables) {
      const tableMatches = html.matchAll(/<table>(.+?)<\/table>/gs);
      for (const match of tableMatches) {
        const tableHTML = match[1];
        const table = this.parseHTMLTable(tableHTML);
        if (table.length > 0) {
          elements.push({
            type: 'table',
            content: table,
          });
        }
      }
    }

    // Extract raw text
    const rawText = this.stripHTML(html);

    return {
      fileName: path.basename(filePath),
      fileType: 'docx',
      elements,
      rawText,
      metadata: {
        parseTime: 0,
        fileSize: 0,
        warnings,
        errors: [],
      },
    };
  }

  /**
   * Parse TXT file
   */
  private async parseTXT(filePath: string): Promise<ParsedDocumentResult> {
    const text = fs.readFileSync(filePath, 'utf-8');
    const elements: ExtractedElement[] = [];

    // Split into paragraphs
    const paragraphs = text
      .split(/\n\n+/)
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    paragraphs.forEach((para) => {
      // Detect headings (short lines, ALL CAPS, or ending with colon)
      const isHeading =
        para.length < 100 &&
        (para === para.toUpperCase() || para.endsWith(':') || !para.endsWith('.'));

      if (isHeading && this.options.extractHeadings) {
        elements.push({
          type: 'heading',
          content: para.replace(/:$/, ''),
          level: para === para.toUpperCase() ? 1 : 2,
        });
      } else {
        elements.push({
          type: 'paragraph',
          content: para,
        });
      }
    });

    return {
      fileName: path.basename(filePath),
      fileType: 'txt',
      elements,
      rawText: text,
      metadata: {
        parseTime: 0,
        fileSize: 0,
        warnings: [],
        errors: [],
      },
    };
  }

  /**
   * Parse Excel/CSV file
   */
  private async parseExcel(filePath: string, fileType: 'xlsx' | 'csv'): Promise<ParsedDocumentResult> {
    const workbook = XLSX.readFile(filePath);
    const elements: ExtractedElement[] = [];
    const warnings: string[] = [];
    let rawText = '';

    // Process each sheet
    workbook.SheetNames.forEach((sheetName) => {
      const sheet = workbook.Sheets[sheetName];

      // Convert sheet to JSON
      const jsonData: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      if (jsonData.length === 0) {
        warnings.push(`Sheet "${sheetName}" is empty`);
        return;
      }

      // Add sheet name as heading
      elements.push({
        type: 'heading',
        content: sheetName,
        level: 1,
        metadata: { sheetName },
      });

      // Add table
      const headers = jsonData[0].map((cell) => String(cell || ''));
      const rows = jsonData.slice(1).map((row) => row.map((cell) => String(cell || '')));

      elements.push({
        type: 'table',
        content: [headers, ...rows],
        metadata: { sheetName },
      });

      // Add to raw text
      rawText += `\n\n=== ${sheetName} ===\n`;
      rawText += jsonData.map((row) => row.join('\t')).join('\n');
    });

    return {
      fileName: path.basename(filePath),
      fileType,
      pageCount: workbook.SheetNames.length,
      elements,
      rawText,
      metadata: {
        parseTime: 0,
        fileSize: 0,
        warnings,
        errors: [],
      },
    };
  }

  /**
   * Strip HTML tags
   */
  private stripHTML(html: string): string {
    return html
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Parse HTML table to 2D array
   */
  private parseHTMLTable(tableHTML: string): string[][] {
    const rows: string[][] = [];

    // Extract rows
    const rowMatches = tableHTML.matchAll(/<tr>(.+?)<\/tr>/gs);
    for (const rowMatch of rowMatches) {
      const rowHTML = rowMatch[1];
      const cells: string[] = [];

      // Extract cells (th or td)
      const cellMatches = rowHTML.matchAll(/<t[hd]>(.+?)<\/t[hd]>/g);
      for (const cellMatch of cellMatches) {
        cells.push(this.stripHTML(cellMatch[1]));
      }

      if (cells.length > 0) {
        rows.push(cells);
      }
    }

    return rows;
  }
}

/**
 * Convenience function to parse a file
 */
export async function parseDocument(filePath: string, options?: Partial<ParserOptions>): Promise<ParsedDocumentResult> {
  const parser = new DocumentParser(options);
  return parser.parseFile(filePath);
}
