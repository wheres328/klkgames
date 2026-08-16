import { db } from "@/lib/db";
import { Prisma, $Enums } from "@/generated/prisma/client";

export interface AuditLogInput {
  actorId?: string | null;
  action: $Enums.AuditAction;
  entityType: string;
  entityId: string;
  before?: Prisma.InputJsonValue | undefined;
  after?: Prisma.InputJsonValue | undefined;
  ip?: string | null;
  userAgent?: string | null;
}

export interface AuditLogQueryOptions {
  actorId?: string;
  entityType?: string;
  entityId?: string;
  action?: $Enums.AuditAction;
  limit?: number;
  offset?: number;
}

function isSerializable(value: unknown): value is Prisma.InputJsonValue {
  return (
    value === null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  );
}

function hasToNumber(value: unknown): value is { toNumber(): number } {
  return (
    typeof value === "object" &&
    value !== null &&
    "toNumber" in value &&
    typeof (value as { toNumber(): unknown }).toNumber === "function"
  );
}

// Convierte cualquier valor (Date, Decimal, Date[]) a un JSON seguro para AuditLog.
// No registra contraseñas, tokens ni campos sensibles: quien llame decide qué enviar.
export function serializeForAudit(value: unknown): Prisma.InputJsonValue | undefined {
  if (value === undefined) return undefined;
  if (isSerializable(value)) return value;
  if (value instanceof Date) return value.toISOString();
  if (hasToNumber(value)) return value.toNumber();

  if (Array.isArray(value)) {
    const items = value
      .map((item) => serializeForAudit(item))
      .filter((item): item is Prisma.InputJsonValue => item !== undefined);
    return items;
  }

  if (typeof value === "object") {
    const record: Record<string, Prisma.InputJsonValue> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      const serialized = serializeForAudit(val);
      if (serialized !== undefined) record[key] = serialized;
    }
    return record;
  }

  return undefined;
}

// Utilidad central para AuditLog: TODAS las operaciones administrativas que
// deban quedar registradas pasan por aquí. Nunca se registran contraseñas,
// tokens ni IPs inventadas (ip llega solo si el entorno la provee).
export async function createAuditLog(input: AuditLogInput, tx?: Prisma.TransactionClient) {
  const { before, after, ...rest } = input;
  const client = tx ?? db;
  return client.auditLog.create({
    data: {
      ...rest,
      before: before === undefined ? Prisma.JsonNull : before,
      after: after === undefined ? Prisma.JsonNull : after,
    },
  });
}

export async function listAuditLogs(options: AuditLogQueryOptions = {}) {
  const { actorId, entityType, entityId, action, limit = 50, offset = 0 } = options;
  return db.auditLog.findMany({
    where: {
      ...(actorId ? { actorId } : {}),
      ...(entityType ? { entityType } : {}),
      ...(entityId ? { entityId } : {}),
      ...(action ? { action } : {}),
    },
    orderBy: { createdAt: "desc" },
    skip: Math.max(0, offset),
    take: Math.min(Math.max(1, limit), 200),
    include: { actor: { select: { id: true, username: true, name: true } } },
  });
}

export async function getAuditLogById(id: string) {
  return db.auditLog.findUnique({
    where: { id },
    include: { actor: { select: { id: true, username: true, name: true } } },
  });
}
