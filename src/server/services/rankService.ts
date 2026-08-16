import { db } from "@/lib/db";
import { createAuditLog, serializeForAudit } from "@/server/services/auditService";
import type { RankInput } from "@/server/validation/rankValidation";

export interface RankView {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  isDefault: boolean;
  permissions: string[];
  userCount: number;
  createdAt: Date;
}

function toRankView(row: {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  isDefault: boolean;
  permissions: string[];
  createdAt: Date;
  _count: { users: number };
}): RankView {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    color: row.color,
    isDefault: row.isDefault,
    permissions: row.permissions,
    userCount: row._count.users,
    createdAt: row.createdAt,
  };
}

export async function listRanks(): Promise<RankView[]> {
  const rows = await db.rank.findMany({
    orderBy: [{ isDefault: "desc" }, { name: "asc" }],
    include: { _count: { select: { users: true } } },
  });
  return rows.map(toRankView);
}

export async function getRankById(id: string): Promise<RankView | null> {
  const row = await db.rank.findUnique({
    where: { id },
    include: { _count: { select: { users: true } } },
  });
  return row ? toRankView(row) : null;
}

// Solo puede haber un rango "por defecto": al marcar uno se desmarcan los demás.
export async function createRank(input: RankInput, options?: { actorId?: string }): Promise<RankView> {
  const row = await db.$transaction(async (tx) => {
    if (input.isDefault) {
      await tx.rank.updateMany({ where: { isDefault: true }, data: { isDefault: false } });
    }
    return tx.rank.create({
      data: {
        name: input.name,
        description: input.description ?? null,
        color: input.color ?? null,
        permissions: input.permissions,
        isDefault: input.isDefault ?? false,
      },
    });
  });

  await createAuditLog({
    actorId: options?.actorId ?? null,
    action: "CREATE_RANK",
    entityType: "Rank",
    entityId: row.id,
    after: serializeForAudit({ name: row.name, permissions: row.permissions }),
  });

  return toRankView({ ...row, _count: { users: 0 } });
}

export async function updateRank(
  id: string,
  input: RankInput,
  options?: { actorId?: string },
): Promise<RankView> {
  const before = await db.rank.findUnique({
    where: { id },
    select: { id: true, name: true, permissions: true, isDefault: true },
  });
  if (!before) throw new Error("Rango no encontrado.");

  const row = await db.$transaction(async (tx) => {
    if (input.isDefault) {
      await tx.rank.updateMany({ where: { id: { not: id }, isDefault: true }, data: { isDefault: false } });
    }
    return tx.rank.update({
      where: { id },
      data: {
        name: input.name,
        description: input.description ?? null,
        color: input.color ?? null,
        permissions: input.permissions,
        isDefault: input.isDefault ?? before.isDefault,
      },
    });
  });

  await createAuditLog({
    actorId: options?.actorId ?? null,
    action: "UPDATE_RANK",
    entityType: "Rank",
    entityId: id,
    before: serializeForAudit(before),
    after: serializeForAudit({ name: row.name, permissions: row.permissions, isDefault: row.isDefault }),
  });

  return toRankView({ ...row, _count: { users: 0 } });
}

export async function deleteRank(id: string, options?: { actorId?: string }): Promise<void> {
  const before = await db.rank.findUnique({
    where: { id },
    select: { id: true, name: true, isDefault: true },
  });
  if (!before) throw new Error("Rango no encontrado.");
  if (before.isDefault) {
    throw new Error("No puedes eliminar el rango por defecto.");
  }

  await db.rank.delete({ where: { id } });
  await createAuditLog({
    actorId: options?.actorId ?? null,
    action: "DELETE_RANK",
    entityType: "Rank",
    entityId: id,
    before: serializeForAudit(before),
  });
}

// Asigna/quita un rango a un usuario.
export async function assignRank(
  userId: string,
  rankId: string | null,
  options?: { actorId?: string },
): Promise<void> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { username: true, rankId: true },
  });
  if (!user) throw new Error("Usuario no encontrado.");
  if (rankId) {
    const rank = await db.rank.findUnique({ where: { id: rankId }, select: { id: true } });
    if (!rank) throw new Error("Rango no encontrado.");
  }

  await db.user.update({ where: { id: userId }, data: { rankId } });
  await createAuditLog({
    actorId: options?.actorId ?? null,
    action: "UPDATE_USER",
    entityType: "User",
    entityId: userId,
    after: serializeForAudit({ rankId: rankId ?? null }),
  });
}
