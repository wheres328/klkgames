import { db } from "@/lib/db";

export const REPUTATION_POINTS = {
  COMMENT_CREATED: 5,
  COMMENT_LIKE_RECEIVED: 1,
  GAME_RATED: 2,
} as const;

export const MIN_REPUTATION_TO_APPLY = 25;

export const REPUTATION_REASON_LABELS: Record<string, string> = {
  COMMENT_CREATED: "Comentario publicado",
  COMMENT_LIKE_RECEIVED: "Me gusta en tu comentario",
  GAME_RATED: "Valoraste un juego",
  ADMIN_AWARD: "Ajuste del equipo",
};

type Tx = Parameters<Parameters<typeof db.$transaction>[0]>[0];

export type ReputationReason =
  | "COMMENT_CREATED"
  | "COMMENT_LIKE_RECEIVED"
  | "GAME_RATED"
  | "ADMIN_AWARD";

export interface AwardReputationInput {
  userId: string;
  delta: number;
  reason: ReputationReason;
  referenceId?: string;
  note?: string;
}

// Otorga puntos de reputación. Deduplica por (userId, reason, referenceId)
// para que un mismo "evento" no puntúe dos veces (p. ej. dos clics en un like).
export async function awardReputation(
  tx: Tx,
  input: AwardReputationInput,
): Promise<boolean> {
  if (input.referenceId) {
    const existing = await tx.reputationLog.findUnique({
      where: {
        userId_reason_referenceId: {
          userId: input.userId,
          reason: input.reason,
          referenceId: input.referenceId,
        },
      },
      select: { id: true },
    });
    if (existing) return false;
  }

  await tx.reputationLog.create({
    data: {
      userId: input.userId,
      delta: input.delta,
      reason: input.reason,
      referenceId: input.referenceId ?? null,
      note: input.note,
    },
  });
  await tx.user.update({
    where: { id: input.userId },
    data: { reputation: { increment: input.delta } },
  });
  return true;
}

// Revoca una puntuación concreta (requiere referenceId) y deshace el incremento.
export async function revokeReputation(
  tx: Tx,
  input: { userId: string; reason: ReputationReason; referenceId: string },
): Promise<void> {
  const log = await tx.reputationLog.findFirst({
    where: { userId: input.userId, reason: input.reason, referenceId: input.referenceId },
    select: { delta: true },
  });
  if (!log) return;

  await tx.reputationLog.deleteMany({
    where: { userId: input.userId, reason: input.reason, referenceId: input.referenceId },
  });
  await tx.user.update({
    where: { id: input.userId },
    data: { reputation: { decrement: log.delta } },
  });
}

const LEVELS: Array<{ title: string; min: number }> = [
  { title: "Recluta", min: 0 },
  { title: "Colaborador", min: 10 },
  { title: "Experto", min: 50 },
  { title: "Veterano", min: 150 },
];

export function getReputationLevel(points: number): { title: string; min: number } {
  let level = LEVELS[0];
  for (const candidate of LEVELS) {
    if (points >= candidate.min) level = candidate;
  }
  return level;
}

export interface ReputationLogEntry {
  id: string;
  delta: number;
  reason: string;
  note: string | null;
  createdAt: Date;
}

export async function getReputationHistory(
  userId: string,
  limit = 20,
): Promise<ReputationLogEntry[]> {
  return db.reputationLog.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: Math.min(Math.max(1, limit), 50),
    select: { id: true, delta: true, reason: true, note: true, createdAt: true },
  });
}
