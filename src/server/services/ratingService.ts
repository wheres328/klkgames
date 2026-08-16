import { db } from "@/lib/db";
import { awardReputation, revokeReputation, REPUTATION_POINTS } from "@/server/services/reputationService";

export interface GameRatingStats {
  gameId: string;
  average: number;
  count: number;
  distribution: Array<{ value: number; count: number }>;
}

// Recalcula los contadores denormalizados Game.rating y Game.ratingCount.
// SIEMPRE se ejecuta dentro de la misma transacción que la escritura.
async function recalcGameRating(
  tx: Parameters<Parameters<typeof db.$transaction>[0]>[0],
  gameId: string,
): Promise<void> {
  const aggregate = await tx.gameRating.aggregate({
    where: { gameId },
    _avg: { value: true },
    _count: { value: true },
  });
  await tx.game.update({
    where: { id: gameId },
    data: {
      rating: aggregate._avg.value ?? 0,
      ratingCount: aggregate._count.value,
    },
  });
}

// GameRating es la ÚNICA fuente de verdad: upsert por (userId, gameId).
export async function createRating(userId: string, gameId: string, value: number): Promise<void> {
  await db.$transaction(async (tx) => {
    const existing = await tx.gameRating.findUnique({
      where: { userId_gameId: { userId, gameId } },
      select: { id: true },
    });

    if (existing) {
      await tx.gameRating.update({
        where: { userId_gameId: { userId, gameId } },
        data: { value },
      });
    } else {
      await tx.gameRating.create({ data: { userId, gameId, value } });
      await awardReputation(tx, {
        userId,
        delta: REPUTATION_POINTS.GAME_RATED,
        reason: "GAME_RATED",
        referenceId: gameId,
      });
    }
    await recalcGameRating(tx, gameId);
  });
}

export async function updateRating(userId: string, gameId: string, value: number): Promise<void> {
  await createRating(userId, gameId, value);
}

export async function deleteRating(userId: string, gameId: string): Promise<void> {
  await db.$transaction(async (tx) => {
    await tx.gameRating.deleteMany({ where: { userId, gameId } });
    await revokeReputation(tx, {
      userId,
      reason: "GAME_RATED",
      referenceId: gameId,
    });
    await recalcGameRating(tx, gameId);
  });
}

export async function getUserRating(userId: string, gameId: string): Promise<number | null> {
  const rating = await db.gameRating.findUnique({
    where: { userId_gameId: { userId, gameId } },
    select: { value: true },
  });
  return rating?.value ?? null;
}

export async function getGameRatingStats(gameId: string): Promise<GameRatingStats> {
  const [aggregate, distribution] = await Promise.all([
    db.gameRating.aggregate({
      where: { gameId },
      _avg: { value: true },
      _count: { value: true },
    }),
    db.gameRating.groupBy({
      by: ["value"],
      where: { gameId },
      _count: { value: true },
    }),
  ]);

  return {
    gameId,
    average: aggregate._avg.value ?? 0,
    count: aggregate._count.value,
    distribution: distribution.map((item) => ({
      value: item.value,
      count: item._count.value,
    })),
  };
}
