import { Prisma } from "@prisma/client";
import type { AuditEvent } from "../research-license/engine";
import { prisma } from "../db/prisma";

export type AuditWriter = (event: AuditEvent) => Promise<void>;

export function toAuditLogCreateInput(event: AuditEvent): Prisma.AuditLogUncheckedCreateInput {
  return {
    actorId: event.actorId,
    entityType: event.entityType,
    entityId: event.entityId,
    action: event.action,
    actorRole: event.actorRole,
    organizationScope: event.organizationScope,
    courseScope: event.courseScope,
    correlationId: event.correlationId,
    fromStatus: event.fromStatus,
    toStatus: event.toStatus,
    changes: (event.changes ?? {}) as Prisma.InputJsonValue,
    previousState: event.previousState as Prisma.InputJsonValue | undefined,
    newState: event.newState as Prisma.InputJsonValue | undefined,
    reason: event.reason,
    createdAt: event.timestamp
  };
}

export const persistAuditEvent: AuditWriter = async (event) => {
  await prisma.auditLog.create({
    data: toAuditLogCreateInput(event)
  });
};

export async function persistAuditEvents(events: AuditEvent[]) {
  await prisma.auditLog.createMany({
    data: events.map(toAuditLogCreateInput)
  });
}
