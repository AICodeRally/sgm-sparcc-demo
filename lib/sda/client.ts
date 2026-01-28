/**
 * SDA (Sales Document Analyzer) Client
 *
 * Client library for calling the SDA API service.
 * SDA provides document analysis, gap analysis, and report generation.
 */

const SDA_BASE_URL = process.env.SDA_API_URL || 'http://localhost:3041';

export interface GapAnalysisRequest {
  documentId: string;
  clientName?: string;
}

export interface CoverageReview {
  id: string;
  documentId: string;
  documentName: string;
  clientName: string;
  reviewType: string;
  reviewDate: string;
  frameworkVersion: string;
  status: string;
  coverageIndex: number;
  totalPolicies: number;
  evidencedCount: number;
  partialCount: number;
  notEvidencedCount: number;
  findings: {
    immediate: Finding[];
    priority: Finding[];
    monitor: Finding[];
    closed: Finding[];
  };
}

export interface Finding {
  id: string;
  policyCode: string;
  policyName: string;
  status: string;
  observation: string;
  recommendation: string;
  tcSections?: string[];
}

/**
 * Check if SDA is configured and reachable
 */
export function isSDAConfigured(): boolean {
  return !!process.env.SDA_API_URL;
}

/**
 * Upload a document to SDA for analysis
 */
export async function uploadDocument(
  file: Blob,
  filename: string
): Promise<{ documentId: string }> {
  const formData = new FormData();
  formData.append('file', file, filename);

  const response = await fetch(`${SDA_BASE_URL}/api/documents/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`SDA upload failed: ${response.status} ${response.statusText}`);
  }

  const result = await response.json();
  return { documentId: result.data.documentId };
}

/**
 * Run gap analysis on an uploaded document
 */
export async function runGapAnalysis(
  request: GapAnalysisRequest
): Promise<CoverageReview> {
  const response = await fetch(`${SDA_BASE_URL}/api/analysis/gaps`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`SDA gap analysis failed: ${response.status} - ${text}`);
  }

  const result = await response.json();
  return result.data;
}

/**
 * Generate DOCX report for an analysis
 */
export async function generateDocxReport(
  reviewId: string
): Promise<ArrayBuffer> {
  const response = await fetch(
    `${SDA_BASE_URL}/api/analysis/docx?id=${reviewId}`,
    { method: 'GET' }
  );

  if (!response.ok) {
    throw new Error(`SDA DOCX generation failed: ${response.status}`);
  }

  return response.arrayBuffer();
}

/**
 * Generate Excel report for an analysis
 */
export async function generateExcelReport(
  reviewId: string
): Promise<ArrayBuffer> {
  const response = await fetch(
    `${SDA_BASE_URL}/api/analysis/excel?id=${reviewId}`,
    { method: 'GET' }
  );

  if (!response.ok) {
    throw new Error(`SDA Excel generation failed: ${response.status}`);
  }

  return response.arrayBuffer();
}

/**
 * Generate PDF report for an analysis
 * Note: Requires LibreOffice on SDA server
 */
export async function generatePdfReport(
  reviewId: string
): Promise<ArrayBuffer> {
  const response = await fetch(
    `${SDA_BASE_URL}/api/analysis/pdf?id=${reviewId}`,
    { method: 'GET' }
  );

  if (!response.ok) {
    const result = await response.json().catch(() => ({}));
    throw new Error(result.error?.message || `SDA PDF generation failed: ${response.status}`);
  }

  return response.arrayBuffer();
}

/**
 * Get SDA health/status
 */
export async function getSDAHealth(): Promise<{
  status: string;
  knowledgeBase: { totalPolicies: number };
}> {
  const response = await fetch(`${SDA_BASE_URL}/api/admin/health`, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error(`SDA health check failed: ${response.status}`);
  }

  return response.json();
}

export const sdaClient = {
  isSDAConfigured,
  uploadDocument,
  runGapAnalysis,
  generateDocxReport,
  generateExcelReport,
  generatePdfReport,
  getSDAHealth,
};

export default sdaClient;
