/**
 * Live Committee Provider - Prisma-backed implementation
 *
 * CRITICAL: Requires DATABASE_URL with &schema=sgm_summit_demo
 * Maps between GovernanceCommittee port types and Prisma Committee model.
 *
 * The Prisma model stores members as JSON fields (votingMembers, nonVotingMembers, advisors).
 * The port interface uses structured GovernanceCommittee type with chair, viceChair, members array.
 */

import type {
  ICommitteePort,
  CommitteeMember,
  DecisionThreshold,
  GovernanceCommittee,
} from '@/lib/ports/committee.port';
import { getPrismaClient } from '@/lib/db/prisma';

export class LiveCommitteeProvider implements ICommitteePort {
  private prisma = getPrismaClient();

  /**
   * Map Prisma Committee record to GovernanceCommittee port type
   */
  private mapToGovernanceCommittee(record: any): GovernanceCommittee {
    const votingMembers: CommitteeMember[] = Array.isArray(record.votingMembers)
      ? record.votingMembers
      : [];
    const nonVotingMembers: CommitteeMember[] = Array.isArray(record.nonVotingMembers)
      ? record.nonVotingMembers
      : [];
    const advisors: CommitteeMember[] = Array.isArray(record.advisors)
      ? record.advisors
      : [];

    // Chair is the first voting member with role 'Chair', or the first member
    const chair = votingMembers.find((m: any) => m.role === 'Chair') || votingMembers[0] || {
      id: 'unknown',
      name: 'Unknown',
      role: 'Chair',
      joinedAt: record.createdAt,
    };

    // Vice Chair is the first member with role containing 'Vice'
    const viceChair = votingMembers.find((m: any) =>
      m.role?.toLowerCase().includes('vice')
    ) || undefined;

    // All other members (excluding chair and vice chair)
    const members = [
      ...votingMembers.filter((m: any) => m.id !== chair.id && m.id !== viceChair?.id),
      ...nonVotingMembers,
      ...advisors,
    ];

    // Parse approval authority
    const approvalAuthority: string[] = Array.isArray(record.approvalAuthority)
      ? record.approvalAuthority
      : typeof record.approvalAuthority === 'string'
        ? [record.approvalAuthority]
        : [];

    // Parse decision thresholds from metadata or approvalAuthority
    const decisionThresholds: DecisionThreshold[] = Array.isArray(record.metadata?.decisionThresholds)
      ? record.metadata.decisionThresholds
      : [];

    return {
      id: record.id,
      tenantId: record.tenantId,
      name: record.name,
      acronym: record.code || '',
      type: record.type === 'REVIEW_BOARD' ? 'REVIEW_BOARD' : 'PRIMARY',
      description: record.description || undefined,
      chair,
      viceChair,
      members,
      decisionThresholds,
      approvalAuthority,
      meetingCadence: record.meetingFrequency || 'Monthly',
      quorumRequirement: record.quorumRequirement || 3,
      lastMeetingAt: record.metadata?.lastMeetingAt ? new Date(record.metadata.lastMeetingAt) : undefined,
      nextMeetingAt: record.metadata?.nextMeetingAt ? new Date(record.metadata.nextMeetingAt) : undefined,
      totalDecisions: record.metadata?.totalDecisions || 0,
      totalMeetings: record.metadata?.totalMeetings || 0,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }

  async findAll(tenantId: string): Promise<GovernanceCommittee[]> {
    const committees = await this.prisma.committee.findMany({
      where: { tenantId },
      orderBy: { name: 'asc' },
    });

    return committees.map((c: any) => this.mapToGovernanceCommittee(c));
  }

  async findById(id: string): Promise<GovernanceCommittee | null> {
    const committee = await this.prisma.committee.findUnique({
      where: { id },
    });

    if (!committee) return null;
    return this.mapToGovernanceCommittee(committee);
  }

  async findByAcronym(tenantId: string, acronym: string): Promise<GovernanceCommittee | null> {
    const committee = await this.prisma.committee.findFirst({
      where: { tenantId, code: acronym },
    });

    if (!committee) return null;
    return this.mapToGovernanceCommittee(committee);
  }

  async create(
    data: Omit<GovernanceCommittee, 'id' | 'createdAt' | 'updatedAt' | 'totalDecisions' | 'totalMeetings'>
  ): Promise<GovernanceCommittee> {
    // Build voting members list from chair, viceChair, and members
    const votingMembers: CommitteeMember[] = [data.chair];
    if (data.viceChair) votingMembers.push(data.viceChair);
    const regularMembers = data.members.filter(
      (m) => m.id !== data.chair.id && m.id !== data.viceChair?.id
    );
    votingMembers.push(...regularMembers);

    const committee = await this.prisma.committee.create({
      data: {
        tenantId: data.tenantId,
        code: data.acronym,
        name: data.name,
        description: data.description || null,
        type: data.type,
        meetingFrequency: data.meetingCadence,
        quorumRequirement: data.quorumRequirement,
        votingMembers: JSON.parse(JSON.stringify(votingMembers)),
        nonVotingMembers: JSON.parse(JSON.stringify([])),
        advisors: JSON.parse(JSON.stringify([])),
        approvalAuthority: JSON.parse(JSON.stringify(data.approvalAuthority)),
        status: 'active',
        metadata: JSON.parse(JSON.stringify({
          decisionThresholds: data.decisionThresholds,
          lastMeetingAt: data.lastMeetingAt?.toISOString(),
          nextMeetingAt: data.nextMeetingAt?.toISOString(),
          totalDecisions: 0,
          totalMeetings: 0,
        })),
      },
    });

    return this.mapToGovernanceCommittee(committee);
  }

  async update(id: string, data: Partial<GovernanceCommittee>): Promise<GovernanceCommittee> {
    const updateData: any = { updatedAt: new Date() };

    if (data.name !== undefined) updateData.name = data.name;
    if (data.acronym !== undefined) updateData.code = data.acronym;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.meetingCadence !== undefined) updateData.meetingFrequency = data.meetingCadence;
    if (data.quorumRequirement !== undefined) updateData.quorumRequirement = data.quorumRequirement;
    if (data.approvalAuthority !== undefined) {
      updateData.approvalAuthority = JSON.parse(JSON.stringify(data.approvalAuthority));
    }

    // If members are being updated, rebuild the JSON fields
    if (data.chair || data.viceChair || data.members) {
      const existing = await this.findById(id);
      if (!existing) throw new Error(`Committee ${id} not found`);

      const chair = data.chair || existing.chair;
      const viceChair = data.viceChair !== undefined ? data.viceChair : existing.viceChair;
      const members = data.members || existing.members;

      const votingMembers: CommitteeMember[] = [chair];
      if (viceChair) votingMembers.push(viceChair);
      votingMembers.push(...members.filter(
        (m) => m.id !== chair.id && m.id !== viceChair?.id
      ));

      updateData.votingMembers = JSON.parse(JSON.stringify(votingMembers));
    }

    if (data.decisionThresholds !== undefined) {
      // Store thresholds in metadata
      const current = await this.prisma.committee.findUnique({ where: { id } });
      const currentMetadata = (current?.metadata as any) || {};
      updateData.metadata = JSON.parse(JSON.stringify({
        ...currentMetadata,
        decisionThresholds: data.decisionThresholds,
      }));
    }

    const committee = await this.prisma.committee.update({
      where: { id },
      data: updateData,
    });

    return this.mapToGovernanceCommittee(committee);
  }

  async addMember(committeeId: string, member: CommitteeMember): Promise<GovernanceCommittee> {
    const committee = await this.prisma.committee.findUnique({
      where: { id: committeeId },
    });

    if (!committee) throw new Error(`Committee ${committeeId} not found`);

    const votingMembers: CommitteeMember[] = Array.isArray(committee.votingMembers)
      ? [...(committee.votingMembers as any[])]
      : [];

    // Add the new member
    votingMembers.push(member);

    const updated = await this.prisma.committee.update({
      where: { id: committeeId },
      data: {
        votingMembers: JSON.parse(JSON.stringify(votingMembers)),
        updatedAt: new Date(),
      },
    });

    return this.mapToGovernanceCommittee(updated);
  }

  async removeMember(committeeId: string, memberId: string): Promise<GovernanceCommittee> {
    const committee = await this.prisma.committee.findUnique({
      where: { id: committeeId },
    });

    if (!committee) throw new Error(`Committee ${committeeId} not found`);

    const votingMembers: CommitteeMember[] = Array.isArray(committee.votingMembers)
      ? (committee.votingMembers as any[]).filter((m: any) => m.id !== memberId)
      : [];

    const nonVotingMembers: CommitteeMember[] = Array.isArray(committee.nonVotingMembers)
      ? (committee.nonVotingMembers as any[]).filter((m: any) => m.id !== memberId)
      : [];

    const advisors: CommitteeMember[] = Array.isArray(committee.advisors)
      ? (committee.advisors as any[]).filter((m: any) => m.id !== memberId)
      : [];

    const updated = await this.prisma.committee.update({
      where: { id: committeeId },
      data: {
        votingMembers: JSON.parse(JSON.stringify(votingMembers)),
        nonVotingMembers: JSON.parse(JSON.stringify(nonVotingMembers)),
        advisors: JSON.parse(JSON.stringify(advisors)),
        updatedAt: new Date(),
      },
    });

    return this.mapToGovernanceCommittee(updated);
  }

  async updateThreshold(committeeId: string, threshold: DecisionThreshold): Promise<GovernanceCommittee> {
    const committee = await this.prisma.committee.findUnique({
      where: { id: committeeId },
    });

    if (!committee) throw new Error(`Committee ${committeeId} not found`);

    const metadata = (committee.metadata as any) || {};
    const thresholds: DecisionThreshold[] = Array.isArray(metadata.decisionThresholds)
      ? [...metadata.decisionThresholds]
      : [];

    // Replace existing threshold for the same decision type, or add new
    const existingIdx = thresholds.findIndex(
      (t: DecisionThreshold) => t.decisionType === threshold.decisionType
    );
    if (existingIdx >= 0) {
      thresholds[existingIdx] = threshold;
    } else {
      thresholds.push(threshold);
    }

    // Also update approvalAuthority JSON
    const approvalAuthority: string[] = Array.isArray(committee.approvalAuthority)
      ? [...(committee.approvalAuthority as any[])]
      : [];
    if (!approvalAuthority.includes(threshold.decisionType)) {
      approvalAuthority.push(threshold.decisionType);
    }

    const updated = await this.prisma.committee.update({
      where: { id: committeeId },
      data: {
        metadata: JSON.parse(JSON.stringify({ ...metadata, decisionThresholds: thresholds })),
        approvalAuthority: JSON.parse(JSON.stringify(approvalAuthority)),
        updatedAt: new Date(),
      },
    });

    return this.mapToGovernanceCommittee(updated);
  }

  async getAuthority(
    tenantId: string,
    decisionType: string,
    amount?: number
  ): Promise<{ committee: GovernanceCommittee; threshold: DecisionThreshold } | null> {
    const committees = await this.prisma.committee.findMany({
      where: { tenantId, status: 'active' },
    });

    for (const record of committees) {
      const committee = this.mapToGovernanceCommittee(record);

      for (const threshold of committee.decisionThresholds) {
        if (threshold.decisionType !== decisionType) continue;

        // Check amount bounds if specified
        if (amount !== undefined) {
          if (threshold.amountMin !== undefined && amount < threshold.amountMin) continue;
          if (threshold.amountMax !== undefined && amount > threshold.amountMax) continue;
        }

        return { committee, threshold };
      }

      // Also check approvalAuthority list
      if (committee.approvalAuthority.includes(decisionType)) {
        return {
          committee,
          threshold: {
            decisionType,
            authority: committee.name,
            timelineDays: 7,
          },
        };
      }
    }

    return null;
  }

  async recordDecision(
    committeeId: string,
    decisionType: string,
    decision: any
  ): Promise<void> {
    const committee = await this.prisma.committee.findUnique({
      where: { id: committeeId },
    });

    if (!committee) throw new Error(`Committee ${committeeId} not found`);

    const metadata = (committee.metadata as any) || {};
    const totalDecisions = (metadata.totalDecisions || 0) + 1;
    const decisions = Array.isArray(metadata.decisions) ? [...metadata.decisions] : [];
    decisions.push({
      type: decisionType,
      decision,
      recordedAt: new Date().toISOString(),
    });

    await this.prisma.committee.update({
      where: { id: committeeId },
      data: {
        metadata: JSON.parse(JSON.stringify({
          ...metadata,
          totalDecisions,
          decisions,
        })),
        updatedAt: new Date(),
      },
    });
  }
}
