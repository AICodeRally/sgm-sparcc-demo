/**
 * Governance Database Service
 *
 * Provides CRUD operations for governance reviews, gaps, and conversations.
 */

import { prisma } from '@/lib/db/prisma';
import type {
  GovernanceReview,
  GovernanceGap,
  GovernanceConversation,
  GapFinding,
  GapSeverity,
  GapDisposition,
  Prisma,
} from '@prisma/client';

// Re-export Prisma types for convenience
export type { GovernanceReview, GovernanceGap, GovernanceConversation };
export { GapFinding, GapSeverity, GapDisposition };

// =============================================================================
// GOVERNANCE REVIEW OPERATIONS
// =============================================================================

export interface CreateReviewInput {
  tenantId: string;
  documentId?: string;
  planName: string;
  planType?: string;
  jurisdiction?: string;
  coverageScore: number;
  liabilityScore: number;
  totalPolicies: number;
  totalGaps: number;
  evidenced?: number;
  partial?: number;
  notEvidenced?: number;
  organizationName?: string;
  organizationState?: string;
  riskTriggers?: unknown[];
  rawAnalysis?: unknown;
  analyzedBy?: string;
  isDemo?: boolean;
}

export async function createReview(input: CreateReviewInput): Promise<GovernanceReview> {
  return prisma.governanceReview.create({
    data: {
      tenantId: input.tenantId,
      documentId: input.documentId,
      planName: input.planName,
      planType: input.planType,
      jurisdiction: input.jurisdiction || 'DEFAULT',
      coverageScore: input.coverageScore,
      liabilityScore: input.liabilityScore,
      totalPolicies: input.totalPolicies,
      totalGaps: input.totalGaps,
      evidenced: input.evidenced || 0,
      partial: input.partial || 0,
      notEvidenced: input.notEvidenced || 0,
      organizationName: input.organizationName,
      organizationState: input.organizationState,
      riskTriggers: input.riskTriggers as Prisma.JsonValue,
      rawAnalysis: input.rawAnalysis as Prisma.JsonValue,
      analyzedBy: input.analyzedBy,
      isDemo: input.isDemo || false,
    },
  });
}

export async function getReview(reviewId: string): Promise<GovernanceReview | null> {
  return prisma.governanceReview.findUnique({
    where: { id: reviewId },
    include: {
      gaps: true,
      conversations: true,
    },
  });
}

export async function getReviewsByTenant(
  tenantId: string,
  options?: {
    limit?: number;
    offset?: number;
    includeDemo?: boolean;
  }
): Promise<GovernanceReview[]> {
  return prisma.governanceReview.findMany({
    where: {
      tenantId,
      ...(options?.includeDemo ? {} : { isDemo: false }),
    },
    orderBy: { analyzedAt: 'desc' },
    take: options?.limit || 50,
    skip: options?.offset || 0,
  });
}

export async function updateReviewAiValidation(
  reviewId: string,
  stats: {
    aiValidated: boolean;
    aiConfirmedGaps: number;
    aiFalsePositives: number;
    avgAiConfidence?: number;
  }
): Promise<GovernanceReview> {
  return prisma.governanceReview.update({
    where: { id: reviewId },
    data: stats,
  });
}

export async function updateReviewReport(
  reviewId: string,
  report: { htmlReport?: string; pdfReportUrl?: string }
): Promise<GovernanceReview> {
  return prisma.governanceReview.update({
    where: { id: reviewId },
    data: report,
  });
}

export async function deleteReview(reviewId: string): Promise<void> {
  await prisma.governanceReview.delete({
    where: { id: reviewId },
  });
}

// =============================================================================
// GOVERNANCE GAP OPERATIONS
// =============================================================================

export interface CreateGapInput {
  reviewId: string;
  policyCode: string;
  policyName: string;
  policyCategory?: string;
  requirementId?: string;
  requirementName?: string;
  finding: GapFinding;
  severity: GapSeverity;
  evidence?: string[];
  missingElements?: string[];
}

export async function createGap(input: CreateGapInput): Promise<GovernanceGap> {
  return prisma.governanceGap.create({
    data: {
      reviewId: input.reviewId,
      policyCode: input.policyCode,
      policyName: input.policyName,
      policyCategory: input.policyCategory,
      requirementId: input.requirementId,
      requirementName: input.requirementName,
      finding: input.finding,
      severity: input.severity,
      evidence: input.evidence as Prisma.JsonValue,
      missingElements: input.missingElements as Prisma.JsonValue,
    },
  });
}

export async function createGapsBatch(
  reviewId: string,
  gaps: Omit<CreateGapInput, 'reviewId'>[]
): Promise<number> {
  const result = await prisma.governanceGap.createMany({
    data: gaps.map((gap) => ({
      reviewId,
      policyCode: gap.policyCode,
      policyName: gap.policyName,
      policyCategory: gap.policyCategory,
      requirementId: gap.requirementId,
      requirementName: gap.requirementName,
      finding: gap.finding,
      severity: gap.severity,
      evidence: gap.evidence as Prisma.JsonValue,
      missingElements: gap.missingElements as Prisma.JsonValue,
    })),
  });
  return result.count;
}

export async function getGap(gapId: string): Promise<GovernanceGap | null> {
  return prisma.governanceGap.findUnique({
    where: { id: gapId },
    include: { review: true },
  });
}

export async function getGapsByReview(
  reviewId: string,
  options?: {
    finding?: GapFinding;
    severity?: GapSeverity;
    aiValidated?: boolean;
    disposition?: GapDisposition;
  }
): Promise<GovernanceGap[]> {
  return prisma.governanceGap.findMany({
    where: {
      reviewId,
      ...(options?.finding && { finding: options.finding }),
      ...(options?.severity && { severity: options.severity }),
      ...(options?.aiValidated !== undefined && { aiValidated: options.aiValidated }),
      ...(options?.disposition && { disposition: options.disposition }),
    },
    orderBy: [
      { severity: 'asc' }, // CRITICAL first
      { policyCode: 'asc' },
    ],
  });
}

export async function updateGapAiValidation(
  gapId: string,
  validation: {
    aiIsGap: boolean;
    aiConfidence: number;
    aiReasoning: string;
    aiSuggestedGrade?: string;
  }
): Promise<GovernanceGap> {
  return prisma.governanceGap.update({
    where: { id: gapId },
    data: {
      aiValidated: true,
      aiIsGap: validation.aiIsGap,
      aiConfidence: validation.aiConfidence,
      aiReasoning: validation.aiReasoning,
      aiSuggestedGrade: validation.aiSuggestedGrade,
      aiValidatedAt: new Date(),
    },
  });
}

export async function updateGapRemediation(
  gapId: string,
  remediation: {
    remediationText: string;
    remediationInsertionPoint?: string;
    remediationIntegrationNotes?: string;
    remediationConflictWarnings?: string[];
    remediationConfidence?: number;
  }
): Promise<GovernanceGap> {
  return prisma.governanceGap.update({
    where: { id: gapId },
    data: {
      remediationGenerated: true,
      remediationText: remediation.remediationText,
      remediationInsertionPoint: remediation.remediationInsertionPoint,
      remediationIntegrationNotes: remediation.remediationIntegrationNotes,
      remediationConflictWarnings: remediation.remediationConflictWarnings as Prisma.JsonValue,
      remediationConfidence: remediation.remediationConfidence,
      remediationGeneratedAt: new Date(),
    },
  });
}

export async function updateGapDisposition(
  gapId: string,
  disposition: {
    disposition: GapDisposition;
    dispositionNotes?: string;
    dispositionBy: string;
  }
): Promise<GovernanceGap> {
  return prisma.governanceGap.update({
    where: { id: gapId },
    data: {
      disposition: disposition.disposition,
      dispositionNotes: disposition.dispositionNotes,
      dispositionBy: disposition.dispositionBy,
      dispositionAt: new Date(),
    },
  });
}

// =============================================================================
// GOVERNANCE CONVERSATION OPERATIONS
// =============================================================================

export interface CreateConversationInput {
  tenantId: string;
  reviewId?: string;
  aicrConversationId: string;
  contextSnapshot?: unknown;
  userId?: string;
}

export async function createConversation(
  input: CreateConversationInput
): Promise<GovernanceConversation> {
  return prisma.governanceConversation.create({
    data: {
      tenantId: input.tenantId,
      reviewId: input.reviewId,
      aicrConversationId: input.aicrConversationId,
      contextSnapshot: input.contextSnapshot as Prisma.JsonValue,
      userId: input.userId,
    },
  });
}

export async function getConversation(
  conversationId: string
): Promise<GovernanceConversation | null> {
  return prisma.governanceConversation.findUnique({
    where: { id: conversationId },
    include: { review: true },
  });
}

export async function getConversationByAicrId(
  aicrConversationId: string
): Promise<GovernanceConversation | null> {
  return prisma.governanceConversation.findFirst({
    where: { aicrConversationId },
    include: { review: true },
  });
}

export async function getConversationsByReview(
  reviewId: string
): Promise<GovernanceConversation[]> {
  return prisma.governanceConversation.findMany({
    where: { reviewId },
    orderBy: { lastMessageAt: 'desc' },
  });
}

export async function incrementConversationMessageCount(
  conversationId: string
): Promise<GovernanceConversation> {
  return prisma.governanceConversation.update({
    where: { id: conversationId },
    data: {
      messageCount: { increment: 1 },
      lastMessageAt: new Date(),
    },
  });
}

// =============================================================================
// AGGREGATE STATISTICS
// =============================================================================

export interface ReviewStats {
  totalReviews: number;
  avgCoverageScore: number;
  totalGaps: number;
  totalAiValidated: number;
  coverageDistribution: {
    high: number;    // >= 0.7
    medium: number;  // 0.4 - 0.7
    low: number;     // < 0.4
  };
}

export async function getReviewStatsByTenant(tenantId: string): Promise<ReviewStats> {
  const reviews = await prisma.governanceReview.findMany({
    where: { tenantId, isDemo: false },
    select: {
      coverageScore: true,
      totalGaps: true,
      aiValidated: true,
    },
  });

  const totalReviews = reviews.length;
  const avgCoverageScore = totalReviews > 0
    ? reviews.reduce((sum: number, r: typeof reviews[0]) => sum + r.coverageScore, 0) / totalReviews
    : 0;
  const totalGaps = reviews.reduce((sum: number, r: typeof reviews[0]) => sum + r.totalGaps, 0);
  const totalAiValidated = reviews.filter((r: typeof reviews[0]) => r.aiValidated).length;

  const coverageDistribution = {
    high: reviews.filter((r: typeof reviews[0]) => r.coverageScore >= 0.7).length,
    medium: reviews.filter((r: typeof reviews[0]) => r.coverageScore >= 0.4 && r.coverageScore < 0.7).length,
    low: reviews.filter((r: typeof reviews[0]) => r.coverageScore < 0.4).length,
  };

  return {
    totalReviews,
    avgCoverageScore,
    totalGaps,
    totalAiValidated,
    coverageDistribution,
  };
}

export interface GapStats {
  byFinding: Record<GapFinding, number>;
  bySeverity: Record<GapSeverity, number>;
  byDisposition: Record<GapDisposition, number>;
  aiValidationRate: number;
  remediationRate: number;
}

export async function getGapStatsByReview(reviewId: string): Promise<GapStats> {
  const gaps = await prisma.governanceGap.findMany({
    where: { reviewId },
    select: {
      finding: true,
      severity: true,
      disposition: true,
      aiValidated: true,
      remediationGenerated: true,
    },
  });

  const total = gaps.length;

  type GapRecord = typeof gaps[0];

  const byFinding = {
    EVIDENCED: gaps.filter((g: GapRecord) => g.finding === 'EVIDENCED').length,
    PARTIAL: gaps.filter((g: GapRecord) => g.finding === 'PARTIAL').length,
    NOT_EVIDENCED: gaps.filter((g: GapRecord) => g.finding === 'NOT_EVIDENCED').length,
  };

  const bySeverity = {
    CRITICAL: gaps.filter((g: GapRecord) => g.severity === 'CRITICAL').length,
    HIGH: gaps.filter((g: GapRecord) => g.severity === 'HIGH').length,
    MEDIUM: gaps.filter((g: GapRecord) => g.severity === 'MEDIUM').length,
    LOW: gaps.filter((g: GapRecord) => g.severity === 'LOW').length,
  };

  const byDisposition = {
    PENDING: gaps.filter((g: GapRecord) => g.disposition === 'PENDING').length,
    GAP_CONFIRMED: gaps.filter((g: GapRecord) => g.disposition === 'GAP_CONFIRMED').length,
    COVERED_ELSEWHERE: gaps.filter((g: GapRecord) => g.disposition === 'COVERED_ELSEWHERE').length,
    NOT_APPLICABLE: gaps.filter((g: GapRecord) => g.disposition === 'NOT_APPLICABLE').length,
    REMEDIATION_ADDED: gaps.filter((g: GapRecord) => g.disposition === 'REMEDIATION_ADDED').length,
    WONT_FIX: gaps.filter((g: GapRecord) => g.disposition === 'WONT_FIX').length,
  };

  const aiValidationRate = total > 0
    ? gaps.filter((g: GapRecord) => g.aiValidated).length / total
    : 0;

  const remediationRate = total > 0
    ? gaps.filter((g: GapRecord) => g.remediationGenerated).length / total
    : 0;

  return {
    byFinding,
    bySeverity,
    byDisposition,
    aiValidationRate,
    remediationRate,
  };
}
