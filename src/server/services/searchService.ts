import { db } from "@/lib/db";
import { Prisma, $Enums } from "@/generated/prisma/client";
import { toGameView, type GameRow } from "@/server/services/mappers";
import { toArticleView, type ArticleRow } from "@/server/services/mappers";
import { toGenreView, type GenreRow } from "@/server/services/mappers";
import { toPlatformView, type PlatformRow } from "@/server/services/mappers";
import { gameIncludes } from "@/server/services/gameService";
import { articleIncludes } from "@/server/services/articleService";
import type { Game } from "@/types/game";
import type { Article } from "@/types/article";
import type { Genre } from "@/types/genre";
import type { Platform } from "@/types/platform";

const PUBLISHED = "PUBLISHED";

// ============================== JUEGOS ==============================

export type GameSortKey = "popularity" | "rating" | "date" | "name";

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  totalPages: number;
  currentPage: number;
}

export interface GameSearchParams {
  q?: string;
  genre?: string;
  platform?: string;
  status?: string;
  sort?: GameSortKey;
  page?: number;
  pageSize?: number;
}

export type GameSearchResult = PaginatedResult<Game>;

const STATUS_TO_DB: Record<string, $Enums.GameStatus> = {
  released: "RELEASED",
  "early-access": "EARLY_ACCESS",
  upcoming: "UPCOMING",
  abandoned: "ABANDONED",
  demo: "DEMO",
};

const SORT_ORDERS: Record<GameSortKey, Prisma.GameOrderByWithRelationInput[]> = {
  popularity: [{ ratingCount: "desc" }],
  rating: [{ rating: "desc" }],
  date: [{ releaseDate: "desc" }],
  name: [{ name: "asc" }],
};

// Convierte una consulta de texto en una tsquery de PostgreSQL con prefijos:
// "war world" -> "war:* & world:*". Sanitiza los caracteres del sintaxis tsquery.
export function toTsQuery(query: string): string {
  const sanitized = query
    .trim()
    .toLowerCase()
    .replace(/[&|!():*'"<>\\]/g, " ");
  return sanitized
    .split(/\s+/)
    .filter(Boolean)
    .map((term) => `${term}:*`)
    .join(" & ");
}

function orderBySql(sort: GameSortKey): Prisma.Sql {
  switch (sort) {
    case "name":
      return Prisma.sql`g."name" ASC`;
    case "date":
      return Prisma.sql`g."releaseDate" DESC`;
    case "rating":
      return Prisma.sql`g."rating" DESC`;
    default:
      return Prisma.sql`g."ratingCount" DESC`;
  }
}

// Búsqueda con FTS español sobre la columna "searchVector" (tsvector + índice GIN),
// con filtros por género/plataforma/estado y paginación (page/pageSize/totalPages).
export async function searchGames({
  q,
  genre,
  platform,
  status,
  sort = "popularity",
  page = 1,
  pageSize = 18,
}: GameSearchParams): Promise<GameSearchResult> {
  const currentPage = Math.max(1, page);
  const safePageSize = Math.min(Math.max(1, pageSize), 60);
  const needle = (q ?? "").trim();

  // Sin texto de búsqueda: consulta tipada (sin FTS, más eficiente).
  if (!needle) {
    const where: Prisma.GameWhereInput = {
      publishStatus: PUBLISHED,
      ...(genre ? { genres: { some: { slug: genre } } } : {}),
      ...(platform ? { platforms: { some: { slug: platform } } } : {}),
      ...(status && STATUS_TO_DB[status] ? { status: STATUS_TO_DB[status] } : {}),
    };

    const [total, rows] = await db.$transaction([
      db.game.count({ where }),
      db.game.findMany({
        where,
        orderBy: SORT_ORDERS[sort] ?? SORT_ORDERS.popularity,
        skip: (currentPage - 1) * safePageSize,
        take: safePageSize,
        include: gameIncludes,
      }),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / safePageSize));
    return {
      items: (rows as unknown as GameRow[]).map((row) => toGameView(row)),
      total,
      totalPages,
      currentPage: Math.min(currentPage, totalPages),
    };
  }

  // Búsqueda FTS: tsquery con prefijos contra la columna searchVector.
  const tsQuery = toTsQuery(needle);
  if (!tsQuery) {
    return { items: [], total: 0, totalPages: 1, currentPage };
  }

  const genreId = genre
    ? await db.genre.findUnique({ where: { slug: genre }, select: { id: true } })
    : null;
  const platformId = platform
    ? await db.platform.findUnique({ where: { slug: platform }, select: { id: true } })
    : null;

  const conditions: Prisma.Sql[] = [
    Prisma.sql`g."publishStatus" = 'PUBLISHED'`,
    Prisma.sql`g."searchVector" @@ to_tsquery('spanish', ${tsQuery})`,
  ];
  if (genreId) {
    conditions.push(
      Prisma.sql`EXISTS (SELECT 1 FROM "_GameGenres" gg WHERE gg."A" = g."id" AND gg."B" = ${genreId.id})`,
    );
  }
  if (platformId) {
    conditions.push(
      Prisma.sql`EXISTS (SELECT 1 FROM "_GamePlatforms" gp WHERE gp."A" = g."id" AND gp."B" = ${platformId.id})`,
    );
  }
  if (status && STATUS_TO_DB[status]) {
    conditions.push(Prisma.sql`g."status" = ${STATUS_TO_DB[status]}`);
  }
  const whereSql = Prisma.sql`${Prisma.join(conditions, " AND ")}`;

  const [totalRows, idRows] = await Promise.all([
    db.$queryRaw<{ total: number }[]>(
      Prisma.sql`SELECT COUNT(*)::int AS total FROM "Game" g WHERE ${whereSql}`,
    ),
    db.$queryRaw<{ id: string }[]>(
      Prisma.sql`SELECT g."id" FROM "Game" g WHERE ${whereSql} ORDER BY ${orderBySql(sort)} LIMIT ${safePageSize} OFFSET ${(currentPage - 1) * safePageSize}`,
    ),
  ]);

  const total = totalRows[0]?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / safePageSize));
  const ids = idRows.map((row) => row.id);

  if (ids.length === 0) {
    return { items: [], total, totalPages, currentPage: Math.min(currentPage, totalPages) };
  }

  const rows = (await db.game.findMany({
    where: { id: { in: ids } },
    include: gameIncludes,
  })) as unknown as GameRow[];
  const byId = new Map(rows.map((row) => [row.id, row]));
  const items = ids
    .map((id) => byId.get(id))
    .filter((row): row is GameRow => Boolean(row))
    .map((row) => toGameView(row));

  return { items, total, totalPages, currentPage: Math.min(currentPage, totalPages) };
}

// ============================== ARTÍCULOS ==============================

export async function searchArticles(q: string): Promise<Article[]> {
  const needle = q.trim();
  if (!needle) return [];
  const rows = await db.article.findMany({
    where: {
      status: PUBLISHED,
      OR: [
        { title: { contains: needle, mode: "insensitive" as const } },
        { excerpt: { contains: needle, mode: "insensitive" as const } },
        { category: { contains: needle, mode: "insensitive" as const } },
      ],
    },
    orderBy: [{ publishedAt: "desc" }],
    include: articleIncludes,
  });
  return (rows as unknown as ArticleRow[]).map(toArticleView);
}

// ============================== GÉNEROS / PLATAFORMAS ==============================

export async function searchGenres(q: string): Promise<Genre[]> {
  const needle = q.trim();
  if (!needle) return [];
  const rows = await db.genre.findMany({
    where: {
      OR: [
        { name: { contains: needle, mode: "insensitive" as const } },
        { description: { contains: needle, mode: "insensitive" as const } },
      ],
    },
    orderBy: [{ name: "asc" }],
  });
  return (rows as unknown as GenreRow[]).map(toGenreView);
}

export async function searchPlatforms(q: string): Promise<Platform[]> {
  const needle = q.trim();
  if (!needle) return [];
  const rows = await db.platform.findMany({
    where: {
      OR: [
        { name: { contains: needle, mode: "insensitive" as const } },
        { shortName: { contains: needle, mode: "insensitive" as const } },
      ],
    },
    orderBy: [{ name: "asc" }],
  });
  return (rows as unknown as PlatformRow[]).map(toPlatformView);
}
