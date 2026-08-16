import { db } from "@/lib/db";
import { toGameView, type GameRow } from "@/server/services/mappers";
import { gameIncludes } from "@/server/services/gameService";
import type { Game } from "@/types/game";

// @@unique([userId, gameId]) impide duplicados; el upsert lo refuerza.
export async function addFavorite(userId: string, gameId: string): Promise<void> {
  await db.favorite.upsert({
    where: { userId_gameId: { userId, gameId } },
    update: {},
    create: { userId, gameId },
  });
}

export async function removeFavorite(userId: string, gameId: string): Promise<void> {
  await db.favorite.deleteMany({ where: { userId, gameId } });
}

export async function isFavorite(userId: string, gameId: string): Promise<boolean> {
  const favorite = await db.favorite.findUnique({
    where: { userId_gameId: { userId, gameId } },
    select: { id: true },
  });
  return Boolean(favorite);
}

export async function toggleFavorite(userId: string, gameId: string): Promise<boolean> {
  const favorited = await isFavorite(userId, gameId);
  if (favorited) {
    await removeFavorite(userId, gameId);
  } else {
    await addFavorite(userId, gameId);
  }
  return !favorited;
}

export async function getFavoriteGameIds(userId: string): Promise<string[]> {
  const rows = await db.favorite.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: { gameId: true },
  });
  return rows.map((row) => row.gameId);
}

export async function getUserFavorites(userId: string): Promise<Game[]> {
  const rows = await db.favorite.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      game: { include: gameIncludes },
    },
  });
  return rows.map((row) => toGameView(row.game as unknown as GameRow));
}
