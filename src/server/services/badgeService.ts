import { db } from "@/lib/db";
import type { Badge, UserBadgeView } from "@/types/badge";
import { createAuditLog, serializeForAudit } from "@/server/services/auditService";
import {
  awardBadgeSchema,
  createBadgeSchema,
  updateBadgeSchema,
} from "@/server/validation/badgeValidation";
import type { z } from "zod";

type CreateBadgeInput = z.infer<typeof createBadgeSchema>;
type UpdateBadgeInput = z.infer<typeof updateBadgeSchema>;
type AwardBadgeInput = z.infer<typeof awardBadgeSchema>;

function toBadgeView(row: {
  id: string;
  slug: string;
  name: string;
  description: string;
  image: string;
  createdAt: Date;
}): Badge {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    image: row.image,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function listBadges(): Promise<Badge[]> {
  const rows = await db.badge.findMany({ orderBy: { name: "asc" } });
  return rows.map(toBadgeView);
}

export interface BadgeAdminRow {
  id: string;
  slug: string;
  name: string;
  description: string;
  image: string;
  createdAt: Date;
  awardedCount: number;
}

export async function listBadgesAdmin(): Promise<BadgeAdminRow[]> {
  const rows = await db.badge.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      image: true,
      createdAt: true,
      _count: { select: { awardedTo: true } },
    },
  });
  return rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    image: row.image,
    createdAt: row.createdAt,
    awardedCount: row._count.awardedTo,
  }));
}

export async function getBadgeById(id: string): Promise<Badge | null> {
  const row = await db.badge.findUnique({ where: { id } });
  return row ? toBadgeView(row) : null;
}

export async function createBadge(
  input: CreateBadgeInput,
  options?: { actorId?: string },
): Promise<Badge> {
  const row = await db.$transaction(async (tx) => {
    const created = await tx.badge.create({ data: input });
    await createAuditLog(
      {
        actorId: options?.actorId ?? null,
        action: "CREATE_BADGE",
        entityType: "Badge",
        entityId: created.id,
        after: serializeForAudit(input),
      },
      tx,
    );
    return created;
  });
  return toBadgeView(row);
}

export async function updateBadge(
  id: string,
  input: UpdateBadgeInput,
  options?: { actorId?: string },
): Promise<Badge> {
  const row = await db.$transaction(async (tx) => {
    const before = await tx.badge.findUnique({
      where: { id },
      select: { id: true, slug: true, name: true, description: true, image: true },
    });
    if (!before) throw new Error("Medalla no encontrada.");
    const updated = await tx.badge.update({ where: { id }, data: input });
    await createAuditLog(
      {
        actorId: options?.actorId ?? null,
        action: "UPDATE_BADGE",
        entityType: "Badge",
        entityId: id,
        before: serializeForAudit(before),
        after: serializeForAudit(input),
      },
      tx,
    );
    return updated;
  });
  return toBadgeView(row);
}

export async function deleteBadge(id: string, options?: { actorId?: string }): Promise<void> {
  await db.$transaction(async (tx) => {
    const awarded = await tx.userBadge.count({ where: { badgeId: id } });
    if (awarded > 0) {
      throw new Error(
        `No se puede borrar la medalla: ya fue otorgada a ${awarded} usuario(s).`,
      );
    }
    const before = await tx.badge.findUnique({
      where: { id },
      select: { id: true, slug: true, name: true, description: true, image: true },
    });
    if (!before) throw new Error("Medalla no encontrada.");
    await tx.badge.delete({ where: { id } });
    await createAuditLog(
      {
        actorId: options?.actorId ?? null,
        action: "DELETE_BADGE",
        entityType: "Badge",
        entityId: id,
        before: serializeForAudit(before),
      },
      tx,
    );
  });
}

export async function awardBadge(
  userId: string,
  input: AwardBadgeInput,
  options?: { actorId?: string },
): Promise<void> {
  const { badgeId, reason } = input;
  await db.$transaction(async (tx) => {
    const badge = await tx.badge.findUnique({ where: { id: badgeId } });
    if (!badge) throw new Error("La medalla seleccionada no existe.");
    const target = await tx.user.findUnique({ where: { id: userId } });
    if (!target) throw new Error("El usuario no existe.");

    await tx.userBadge.create({
      data: {
        userId,
        badgeId,
        awardedById: options?.actorId ?? null,
        reason: reason || null,
      },
    });

    await createAuditLog(
      {
        actorId: options?.actorId ?? null,
        action: "AWARD_BADGE",
        entityType: "UserBadge",
        entityId: userId,
        after: serializeForAudit({ badgeId, badge: badge.name, reason: reason || null }),
      },
      tx,
    );
  });
}

export async function revokeBadge(
  userId: string,
  badgeId: string,
  options?: { actorId?: string },
): Promise<void> {
  await db.$transaction(async (tx) => {
    const before = await tx.userBadge.findUnique({
      where: { userId_badgeId: { userId, badgeId } },
      include: { badge: { select: { name: true } } },
    });
    if (!before) throw new Error("El usuario no tiene esa medalla.");

    await tx.userBadge.delete({ where: { userId_badgeId: { userId, badgeId } } });

    await createAuditLog(
      {
        actorId: options?.actorId ?? null,
        action: "REVOKE_BADGE",
        entityType: "UserBadge",
        entityId: userId,
        before: serializeForAudit({ badgeId, badge: before.badge.name }),
      },
      tx,
    );
  });
}

export async function getUserBadges(userId: string): Promise<UserBadgeView[]> {
  const rows = await db.userBadge.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      badge: true,
      awardedBy: { select: { id: true, name: true, username: true } },
    },
  });

  return rows.map((row) => ({
    id: row.id,
    badge: toBadgeView(row.badge),
    awardedBy: row.awardedBy
      ? { name: row.awardedBy.name, username: row.awardedBy.username }
      : null,
    reason: row.reason,
    awardedAt: row.createdAt.toISOString(),
  }));
}

export interface ProfileBadges {
  earned: UserBadgeView[];
  available: Badge[];
}

// Medallas ganadas + definiciones disponibles (para el panel de otorgar del staff).
export async function getProfileBadges(userId: string): Promise<ProfileBadges> {
  const [earned, available] = await Promise.all([
    getUserBadges(userId),
    listBadges(),
  ]);
  const earnedIds = new Set(earned.map((item) => item.badge.id));
  return { earned, available: available.filter((badge) => !earnedIds.has(badge.id)) };
}
