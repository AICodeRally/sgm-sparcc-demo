/**
 * Live Approval Provider - Prisma-backed implementation
 *
 * Implements approval operations using Prisma ORM
 */

import type { IApprovalPort } from '@/lib/ports/approval.port';
import type {
  Approval,
  CreateApproval,
  ApprovalFilters,
  ApprovalWorkflowStep,
  SubmitApprovalDecision,
} from '@/lib/contracts/approval.contract';
import { getPrismaClient } from '@/lib/db/prisma';

export class LiveApprovalProvider implements IApprovalPort {
  private prisma = getPrismaClient();

  async findAll(filters?: ApprovalFilters): Promise<Approval[]> {
    const where: any = {};

    if (filters?.tenantId) where.tenantId = filters.tenantId;
    if (filters?.status) where.status = filters.status;
    if (filters?.entityType) where.entityType = filters.entityType;
    if (filters?.entityId) where.entityId = filters.entityId;
    if (filters?.submittedBy) where.submittedBy = filters.submittedBy;
    if (filters?.priority) where.priority = filters.priority;

    const approvals = await this.prisma.approval.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return approvals as Approval[];
  }

  async findById(id: string): Promise<Approval | null> {
    const approval = await this.prisma.approval.findUnique({
      where: { id },
    });

    return approval as Approval | null;
  }

  async findPending(tenantId: string, approverId?: string): Promise<Approval[]> {
    const where: any = {
      tenantId,
      status: 'pending',
    };

    if (approverId) {
      where.submittedBy = approverId;
    }

    const approvals = await this.prisma.approval.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return approvals as Approval[];
  }

  async findByEntity(entityType: string, entityId: string): Promise<Approval[]> {
    const approvals = await this.prisma.approval.findMany({
      where: { entityType, entityId },
      orderBy: { createdAt: 'desc' },
    });

    return approvals as Approval[];
  }

  async findBySubmitter(userId: string): Promise<Approval[]> {
    const approvals = await this.prisma.approval.findMany({
      where: { submittedBy: userId },
      orderBy: { createdAt: 'desc' },
    });

    return approvals as Approval[];
  }

  async create(data: CreateApproval): Promise<Approval> {
    const approval = await this.prisma.approval.create({
      data: {
        ...data,
        metadata: data.metadata ? JSON.parse(JSON.stringify(data.metadata)) : null,
      },
    });

    return approval as Approval;
  }

  async decide(decision: SubmitApprovalDecision): Promise<Approval> {
    const approval = await this.prisma.approval.update({
      where: { id: decision.approvalId },
      data: {
        decidedBy: decision.decidedBy,
        decidedAt: new Date(),
        decision: decision.decision,
        decisionNotes: decision.comments,
        status: decision.decision,
      },
    });

    return approval as Approval;
  }

  async withdraw(approvalId: string, withdrawnBy: string): Promise<Approval> {
    const approval = await this.prisma.approval.update({
      where: { id: approvalId },
      data: {
        status: 'withdrawn',
        updatedAt: new Date(),
      },
    });

    return approval as Approval;
  }

  async escalate(approvalId: string, escalatedBy: string): Promise<Approval> {
    const approval = await this.prisma.approval.update({
      where: { id: approvalId },
      data: {
        escalatedAt: new Date(),
        status: 'escalated',
        updatedAt: new Date(),
      },
    });

    return approval as Approval;
  }

  async getWorkflowSteps(approvalId: string): Promise<ApprovalWorkflowStep[]> {
    // No workflow steps table available
    return [];
  }

  async getStats(tenantId: string): Promise<{
    totalPending: number;
    totalApproved: number;
    totalRejected: number;
    avgDecisionTimeHours: number;
    slaComplianceRate: number;
  }> {
    const approvals = await this.prisma.approval.findMany({
      where: { tenantId },
    });

    const totalPending = approvals.filter((a: any) => a.status === 'pending').length;
    const totalApproved = approvals.filter((a: any) => a.status === 'approved').length;
    const totalRejected = approvals.filter((a: any) => a.status === 'rejected').length;

    // Calculate average decision time for decided approvals
    const decidedApprovals = approvals.filter((a: any) => a.decidedAt && a.submittedAt);
    let avgDecisionTimeHours = 0;
    if (decidedApprovals.length > 0) {
      const totalHours = decidedApprovals.reduce((sum: number, a: any) => {
        const diffMs = new Date(a.decidedAt).getTime() - new Date(a.submittedAt).getTime();
        return sum + diffMs / (1000 * 60 * 60);
      }, 0);
      avgDecisionTimeHours = totalHours / decidedApprovals.length;
    }

    // Calculate SLA compliance rate
    const withSla = approvals.filter((a: any) => a.slaDeadline && a.decidedAt);
    let slaComplianceRate = 1;
    if (withSla.length > 0) {
      const compliant = withSla.filter(
        (a: any) => new Date(a.decidedAt) <= new Date(a.slaDeadline)
      );
      slaComplianceRate = compliant.length / withSla.length;
    }

    return {
      totalPending,
      totalApproved,
      totalRejected,
      avgDecisionTimeHours,
      slaComplianceRate,
    };
  }

  async countByStatus(tenantId: string): Promise<Record<string, number>> {
    const result = await this.prisma.approval.groupBy({
      by: ['status'],
      where: { tenantId },
      _count: { status: true },
    });

    return result.reduce((acc: Record<string, number>, item: any) => {
      acc[item.status] = item._count.status;
      return acc;
    }, {} as Record<string, number>);
  }
}
