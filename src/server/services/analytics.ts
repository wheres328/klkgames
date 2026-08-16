import { db } from "@/lib/db";

export interface DownloadClickInput {
  gameId: string;
  store?: string;
  path?: string;
  visitorId?: string;
}

// Registra un clic en un enlace de descarga como evento de analítica.
// Aún no hay sistema de sesiones (visitorId) conectado desde el cliente, así que
// cuando no se recibe visitorId se registra una sesión anónima ligera.
export async function recordDownloadClick({
  gameId,
  store,
  path,
  visitorId = "anon",
}: DownloadClickInput): Promise<void> {
  const session = await db.analyticsSession.upsert({
    where: { id: `anon-${visitorId}` },
    update: {},
    create: {
      id: `anon-${visitorId}`,
      visitorId,
      startedAt: new Date(),
    },
  });

  await db.analyticsEvent.create({
    data: {
      sessionId: session.id,
      name: "DOWNLOAD_CLICK",
      path,
      gameId,
      metadata: store ? { store } : undefined,
    },
  });
}

export interface DashboardStats {
  totalGames: number;
  totalUsers: number;
  totalArticles: number;
  totalComments: number;
  totalRatings: number;
  totalFavorites: number;
  totalViews: number;
}

export interface DailyViews {
  date: string;
  views: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const [games, users, articles, comments, ratings, favorites, gameViews, articleViews] =
    await db.$transaction([
      db.game.count(),
      db.user.count(),
      db.article.count(),
      db.comment.count(),
      db.gameRating.count(),
      db.favorite.count(),
      db.gameView.aggregate({ _sum: { views: true } }),
      db.articleView.aggregate({ _sum: { views: true } }),
    ]);

  return {
    totalGames: games,
    totalUsers: users,
    totalArticles: articles,
    totalComments: comments,
    totalRatings: ratings,
    totalFavorites: favorites,
    totalViews: (gameViews._sum.views ?? 0) + (articleViews._sum.views ?? 0),
  };
}

function toISODateKey(date: Date): string {
  const y = date.getUTCFullYear();
  const m = `${date.getUTCMonth() + 1}`.padStart(2, "0");
  const d = `${date.getUTCDate()}`.padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export async function getDailyViews(days = 30): Promise<DailyViews[]> {
  const from = new Date();
  from.setUTCHours(0, 0, 0, 0);
  from.setUTCDate(from.getUTCDate() - (days - 1));

  const [gameViews, articleViews] = await Promise.all([
    db.gameView.findMany({
      where: { date: { gte: from } },
      select: { date: true, views: true },
    }),
    db.articleView.findMany({
      where: { date: { gte: from } },
      select: { date: true, views: true },
    }),
  ]);

  const totals = new Map<string, number>();
  for (const row of gameViews) {
    const key = toISODateKey(new Date(row.date));
    totals.set(key, (totals.get(key) ?? 0) + row.views);
  }
  for (const row of articleViews) {
    const key = toISODateKey(new Date(row.date));
    totals.set(key, (totals.get(key) ?? 0) + row.views);
  }

  const result: DailyViews[] = [];
  for (let i = 0; i < days; i++) {
    const date = new Date(from);
    date.setUTCDate(from.getUTCDate() + i);
    const key = toISODateKey(date);
    result.push({ date: key, views: totals.get(key) ?? 0 });
  }
  return result;
}

export async function getTopViewedGames(
  limit = 10,
): Promise<Array<{ slug: string; name: string; views: number }>> {
  const rows = await db.gameView.groupBy({
    by: ["gameId"],
    _sum: { views: true },
    orderBy: { _sum: { views: "desc" } },
    take: limit,
  });
  const gameIds = rows.map((row) => row.gameId);
  const games = await db.game.findMany({
    where: { id: { in: gameIds } },
    select: { id: true, slug: true, name: true },
  });
  const byId = new Map(games.map((game) => [game.id, game]));
  return rows.flatMap((row) => {
    const game = byId.get(row.gameId);
    if (!game) return [];
    return [{ slug: game.slug, name: game.name, views: row._sum.views ?? 0 }];
  });
}
