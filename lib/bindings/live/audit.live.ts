/**
 * Live Audit Provider - Prisma-backed implementation
 *
 * CRITICAL: Audit logs are APPEND-ONLY. No update or delete methods.
 * Requires DATABASE_URL with &schema=sgm_summit_demo
 */

import type { IAuditPort } from '@/lib/ports/audit.port';
import type {
  AuditLog,
  CreateAuditLog,
  AuditLogFilters,
  AuditSummary,
} from '@/lib/contracts/audit-log.contract';
import { getPrismaClient } from '@/lib/db/prisma';

export class LiveAuditProvider implements IAuditPort {
  private prisma = getPrismaClient();

  async findAll(filters?: AuditLogFilters): Promise<AuditLog[]> {
    const where: any = {};

    if (filters?.tenantId) where.tenantId = filters.tenantId;
    if (filters?.eventType) where.eventType = filters.eventType;
    if (filters?.entityType) where.entityType = filters.entityType;
    if (filters?.entityId) where.entityId = filters.entityId;
    if (filters?.actorId) where.actorId = filters.actorId;
    if (filters?.severity) where.severity = filters.severity;
    if (filters?.occurredAfter) {
      where.occurredAt = { gte: filters.occurredAfter };
    }
    if (filters?.occurredBefore) {
      where.occurredAt = { ...where.occurredAt, lte: filters.occurredBefore };
    }
    if (filters?.search) {
      where.OR = [
        { message: { contains: filters.search, mode: 'insensitive' } },
        { entityName: { contains: filters.search, mode: 'insensitive' } },
        { actorName: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const logs = await this.prisma.auditLog.findMany({
      where,
      orderBy: { occurredAt: 'desc' },
    });

    return logs as AuditLog[];
  }

  async findByEntity(entityType: string, entityId: string): Promise<AuditLog[]> {
    const logs = await this.prisma.auditLog.findMany({
      where: { entityType, entityId },
      orderBy: { occurredAt: 'desc' },
    });

    return logs as AuditLog[];
  }

  async findByActor(actorId: string): Promise<AuditLog[]> {
    const logs = await this.prisma.auditLog.findMany({
      where: { actorId },
      orderBy: { occurredAt: 'desc' },
    });

    return logs as AuditLog[];
  }

  async findByEventType(tenantId: string, eventType: AuditLog['eventType']): Promise<AuditLog[]> {
    const logs = await this.prisma.auditLog.findMany({
      where: { tenantId, eventType },
      orderBy: { occurredAt: 'desc' },
    });

    return logs as AuditLog[];
  }

  async findRecent(tenantId: string, limit: number = 50): Promise<AuditLog[]> {
    const logs = await this.prisma.auditLog.findMany({
      where: { tenantId },
      orderBy: { occurredAt: 'desc' },
      take: limit,
    });

    return logs as AuditLog[];
  }

  async create(data: CreateAuditLog): Promise<AuditLog> {
    const log = await this.prisma.auditLog.create({
      data: {
        ...data,
        occurredAt: new Date(),
        changesBefore: data.changesBefore ? JSON.parse(JSON.stringify(data.changesBefore)) : null,
        changesAfter: data.changesAfter ? JSON.parse(JSON.stringify(data.changesAfter)) : null,
        metadata: data.metadata ? JSON.parse(JSON.stringify(data.metadata)) : null,
      },
    });

    return log as AuditLog;
  }

  async createBatch(entries: CreateAuditLog[]): Promise<AuditLog[]> {
    const results: AuditLog[] = [];

    for (const entry of entries) {
      const log = await this.create(entry);
      results.push(log);
    }

    return results;
  }

  async getSummary(tenantId: string, startDate?: Date, endDate?: Date): Promise<AuditSummary> {
    const where: any = { tenantId };
    if (startDate) {
      where.occurredAt = { gte: startDate };
    }
    if (endDate) {
      where.occurredAt = { ...where.occurredAt, lte: endDate };
    }

    // Count total events
    const totalEvents = await this.prisma.auditLog.count({ where });

    // Count by event type
    const eventTypeGroups = await this.prisma.auditLog.groupBy({
      by: ['eventType'],
      where,
      _count: { eventType: true },
    });
    const eventsByType = eventTypeGroups.reduce((acc: Record<string, number>, item: any) => {
      acc[item.eventType] = item._count.eventType;
      return acc;
    }, {} as Record<string, number>);

    // Count by severity
    const severityGroups = await this.prisma.auditLog.groupBy({
      by: ['severity'],
      where,
      _count: { severity: true },
    });
    const eventsBySeverity = severityGroups.reduce((acc: Record<string, number>, item: any) => {
      acc[item.severity] = item._count.severity;
      return acc;
    }, {} as Record<string, number>);

    // Top actors
    const actorGroups = await this.prisma.auditLog.groupBy({
      by: ['actorId', 'actorName'],
      where,
      _count: { actorId: true },
      orderBy: { _count: { actorId: 'desc' } },
      take: 10,
    });
    const topActors = actorGroups.map((item: any) => ({
      actorId: item.actorId,
      actorName: item.actorName || undefined,
      eventCount: item._count.actorId,
    }));

    // Recent events
    const recentEvents = await this.prisma.auditLog.findMany({
      where,
      orderBy: { occurredAt: 'desc' },
      take: 10,
    });

    return {
      totalEvents,
      eventsByType,
      eventsBySeverity,
      topActors,
      recentEvents: recentEvents as AuditLog[],
    };
  }

  async countByEventType(tenantId: string): Promise<Record<string, number>> {
    const result = await this.prisma.auditLog.groupBy({
      by: ['eventType'],
      where: { tenantId },
      _count: { eventType: true },
    });

    return result.reduce((acc: Record<string, number>, item: any) => {
      acc[item.eventType] = item._count.eventType;
      return acc;
    }, {} as Record<string, number>);
  }

  async countBySeverity(tenantId: string): Promise<Record<string, number>> {
    const result = await this.prisma.auditLog.groupBy({
      by: ['severity'],
      where: { tenantId },
      _count: { severity: true },
    });

    return result.reduce((acc: Record<string, number>, item: any) => {
      acc[item.severity] = item._count.severity;
      return acc;
    }, {} as Record<string, number>);
  }

  async export(filters: AuditLogFilters, format: 'json' | 'csv'): Promise<string> {
    const logs = await this.findAll(filters);

    if (format === 'json') {
      return JSON.stringify(logs, null, 2);
    }

    // CSV format
    if (logs.length === 0) return '';

    const headers = [
      'id', 'tenantId', 'eventType', 'severity', 'message',
      'entityType', 'entityId', 'entityName',
      'actorId', 'actorName', 'actorRole',
      'occurredAt',
    ];

    const csvRows = [headers.join(',')];

    for (const log of logs) {
      const row = headers.map((header) => {
        const value = (log as any)[header];
        if (value === null || value === undefined) return '';
        const str = String(value);
        // Escape CSV values containing commas or quotes
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      });
      csvRows.push(row.join(','));
    }

    return csvRows.join('\n');
  }
}
