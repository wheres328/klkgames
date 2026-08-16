import { db } from "@/lib/db";
import { Prisma, $Enums } from "@/generated/prisma/client";
import { toGameView, type GameRow } from "@/server/services/mappers";
import {
  adminCreateGameSchema,
  adminUpdateGameSchema,
  createGameImageSchema,
  updateGameImageSchema,
} from "@/server/validation/gameValidation";
import { createAuditLog, serializeForAudit } from "@/server/services/auditService";
import { recomputeGenreCounts } from "@/server/services/genreService";
import { getDownloadsForGame } from "@/server/services/downloadService";
import type { z } from "zod";
import type { Game } from "@/types/game";

const PUBLISHED = "PUBLISHED";

type CreateGameInput = z.infer<typeof adminCreateGameSchema>;
type UpdateGameInput = z.infer<typeof adminUpdateGameSchema>;
type CreateGameImageInput = z.infer<typeof createGameImageSchema>;
type UpdateGameImageInput = z.infer<typeof updateGameImageSchema>;

export const gameIncludes = {
  genres: true,
  platforms: true,
  images: { orderBy: { order: "asc" as const } },
  videos: { orderBy: { order: "asc" as const } },
  downloads: { orderBy: { order: "asc" as const } },
  requirements: true,
} as const;

export interface GameListOptions {
  q?: string;
  status?: string;
  publishStatus?: string;
  genreSlug?: string;
  platformSlug?: string;
  page?: number;
  pageSize?: number;
}

export interface GameListResult {
  items: Game[];
  total: number;
  totalPages: number;
  currentPage: number;
}

async function toView(row: GameRow, withBreakdown = false): Promise<Game> {
  let breakdown: Array<{ value: number; count: number }> = [];
  if (withBreakdown) {
    const grouped = await db.gameRating.groupBy({
      by: ["value"],
      where: { gameId: row.id },
      _count: { value: true },
    });
    breakdown = grouped.map((item) => ({
      value: item.value,
      count: item._count.value,
    }));
  }
  return toGameView(row, breakdown);
}

function toViews(rows: GameRow[]): Game[] {
  return rows.map((row) => toGameView(row));
}

export async function getGameBySlug(slug: string): Promise<Game | null> {
  const row = await db.game.findFirst({
    where: { slug, publishStatus: PUBLISHED },
    include: gameIncludes,
  });
  return row ? toView(row as unknown as GameRow, true) : null;
}

// Lectura administrativa: no filtra por estado editorial.
export async function getGameById(id: string): Promise<Game | null> {
  const row = await db.game.findUnique({
    where: { id },
    include: gameIncludes,
  });
  return row ? toView(row as unknown as GameRow, true) : null;
}

export async function getGameSlugById(id: string): Promise<string | null> {
  const row = await db.game.findUnique({
    where: { id },
    select: { slug: true },
  });
  return row?.slug ?? null;
}

export async function listPublishedGameSlugs(): Promise<string[]> {
  const rows = await db.game.findMany({
    where: { publishStatus: PUBLISHED },
    select: { slug: true },
  });
  return rows.map((row) => row.slug);
}

export async function listPublishedGames(limit?: number): Promise<Game[]> {
  const rows = await db.game.findMany({
    where: { publishStatus: PUBLISHED },
    orderBy: [{ ratingCount: "desc" }],
    take: limit,
    include: gameIncludes,
  });
  return toViews(rows as unknown as GameRow[]);
}

// Listado administrativo con filtros y paginación (respeta publishStatus).
export async function listGames(options: GameListOptions = {}): Promise<GameListResult> {
  const { q, status, publishStatus, genreSlug, platformSlug, page = 1, pageSize = 20 } = options;
  const where: Prisma.GameWhereInput = {
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" as const } },
            { developer: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...(status && status in $Enums.GameStatus ? { status: status as $Enums.GameStatus } : {}),
    ...(publishStatus && publishStatus in $Enums.GamePublishStatus
      ? { publishStatus: publishStatus as $Enums.GamePublishStatus }
      : {}),
    ...(genreSlug ? { genres: { some: { slug: genreSlug } } } : {}),
    ...(platformSlug ? { platforms: { some: { slug: platformSlug } } } : {}),
  };

  const currentPage = Math.max(1, page);
  const safePageSize = Math.min(Math.max(1, pageSize), 100);

  const [total, rows] = await db.$transaction([
    db.game.count({ where }),
    db.game.findMany({
      where,
      orderBy: [{ createdAt: "desc" }],
      skip: (currentPage - 1) * safePageSize,
      take: safePageSize,
      include: gameIncludes,
    }),
  ]);

  return {
    items: toViews(rows as unknown as GameRow[]),
    total,
    totalPages: Math.max(1, Math.ceil(total / safePageSize)),
    currentPage,
  };
}

export async function getGamesBySlugs(slugs: string[]): Promise<Game[]> {
  if (slugs.length === 0) return [];
  const rows = await db.game.findMany({
    where: { slug: { in: slugs }, publishStatus: PUBLISHED },
    include: gameIncludes,
  });
  const bySlug = new Map(rows.map((row) => [row.slug, row]));
  return slugs.flatMap((slug) => {
    const row = bySlug.get(slug);
    return row ? [toGameView(row as unknown as GameRow)] : [];
  });
}

export async function getGamesByIds(ids: string[]): Promise<Game[]> {
  if (ids.length === 0) return [];
  const rows = await db.game.findMany({
    where: { id: { in: ids }, publishStatus: PUBLISHED },
    include: gameIncludes,
  });
  const byId = new Map(rows.map((row) => [row.id, row]));
  return ids.flatMap((id) => {
    const row = byId.get(id);
    return row ? [toGameView(row as unknown as GameRow)] : [];
  });
}

export async function getFeaturedGame(): Promise<Game | null> {
  const row = await db.game.findFirst({
    where: { publishStatus: PUBLISHED },
    orderBy: [{ rating: "desc" }, { ratingCount: "desc" }],
    include: gameIncludes,
  });
  return row ? toView(row as unknown as GameRow) : null;
}

export async function getTrendingGames(limit = 8): Promise<Game[]> {
  const rows = await db.game.findMany({
    where: { publishStatus: PUBLISHED },
    orderBy: [{ ratingCount: "desc" }],
    take: limit,
    include: gameIncludes,
  });
  return toViews(rows as unknown as GameRow[]);
}

export async function getEditorPicks(limit = 6): Promise<Game[]> {
  const rows = await db.game.findMany({
    where: { publishStatus: PUBLISHED },
    orderBy: [{ rating: "desc" }, { ratingCount: "desc" }],
    take: limit,
    include: gameIncludes,
  });
  return toViews(rows as unknown as GameRow[]);
}

export async function getMostPopularGames(limit = 5): Promise<Game[]> {
  const rows = await db.game.findMany({
    where: { publishStatus: PUBLISHED, status: "RELEASED" },
    orderBy: [{ ratingCount: "desc" }],
    take: limit,
    include: gameIncludes,
  });
  return toViews(rows as unknown as GameRow[]);
}

export async function getTopRatedGames(limit = 5): Promise<Game[]> {
  const rows = await db.game.findMany({
    where: { publishStatus: PUBLISHED, status: "RELEASED" },
    orderBy: [{ rating: "desc" }, { ratingCount: "desc" }],
    take: limit,
    include: gameIncludes,
  });
  return toViews(rows as unknown as GameRow[]);
}

export async function getNewReleases(limit = 8): Promise<Game[]> {
  const rows = await db.game.findMany({
    where: { publishStatus: PUBLISHED, status: { not: "UPCOMING" } },
    orderBy: [{ releaseDate: "desc" }],
    take: limit,
    include: gameIncludes,
  });
  return toViews(rows as unknown as GameRow[]);
}

export async function getUpcomingGames(limit = 1): Promise<Game[]> {
  const rows = await db.game.findMany({
    where: { publishStatus: PUBLISHED, status: "UPCOMING" },
    orderBy: [{ releaseDate: "asc" }],
    take: limit,
    include: gameIncludes,
  });
  return toViews(rows as unknown as GameRow[]);
}

export async function getEarlyAccessGames(limit = 8): Promise<Game[]> {
  const rows = await db.game.findMany({
    where: { publishStatus: PUBLISHED, status: "EARLY_ACCESS" },
    orderBy: [{ ratingCount: "desc" }],
    take: limit,
    include: gameIncludes,
  });
  return toViews(rows as unknown as GameRow[]);
}

export async function getGamesByGenre(genreSlug: string): Promise<Game[]> {
  const rows = await db.game.findMany({
    where: { publishStatus: PUBLISHED, genres: { some: { slug: genreSlug } } },
    orderBy: [{ ratingCount: "desc" }],
    include: gameIncludes,
  });
  return toViews(rows as unknown as GameRow[]);
}

export async function getGamesByPlatform(platformSlug: string): Promise<Game[]> {
  const rows = await db.game.findMany({
    where: { publishStatus: PUBLISHED, platforms: { some: { slug: platformSlug } } },
    orderBy: [{ ratingCount: "desc" }],
    include: gameIncludes,
  });
  return toViews(rows as unknown as GameRow[]);
}

// GameSimilar (schema v3): gameId es SIEMPRE el id lexicográficamente menor del par.
export async function getSimilarGames(gameId: string, limit = 6): Promise<Game[]> {
  const rows = await db.gameSimilar.findMany({
    where: { OR: [{ gameId }, { relatedGameId: gameId }] },
    orderBy: [{ weight: "desc" }, { order: "asc" }],
    take: limit,
    select: { gameId: true, relatedGameId: true },
  });
  const ids = rows.map((row) => (row.gameId === gameId ? row.relatedGameId : row.gameId));
  return getGamesByIds(ids);
}

// ============================== CRUD ==============================

export async function createGame(
  input: CreateGameInput,
  options?: { actorId?: string },
): Promise<Game> {
  const {
    genreIds,
    platformIds,
    tagIds,
    releaseDate,
    coverUrl,
    screenshots,
    videoUrl,
    downloads,
    requirements,
    ...rest
  } = input;
  const row = await db.$transaction(async (tx) => {
    const created = await tx.game.create({
      data: {
        ...rest,
        releaseDate: new Date(releaseDate),
        publishedAt: rest.publishStatus === "PUBLISHED" ? new Date() : null,
        ...(genreIds.length ? { genres: { connect: genreIds.map((id) => ({ id })) } } : {}),
        ...(platformIds.length
          ? { platforms: { connect: platformIds.map((id) => ({ id })) } }
          : {}),
        ...(tagIds.length ? { tags: { connect: tagIds.map((id) => ({ id })) } } : {}),
      },
      include: gameIncludes,
    });

    await tx.gameImage.create({
      data: {
        gameId: created.id,
        type: $Enums.ImageType.COVER,
        url: coverUrl,
        alt: `Portada de ${created.name}`,
        order: 0,
      },
    });

    if (screenshots.length) {
      await tx.gameImage.createMany({
        data: screenshots.map((url, index) => ({
          gameId: created.id,
          type: $Enums.ImageType.SCREENSHOT,
          url,
          alt: `Captura ${index + 1} de ${created.name}`,
          order: index + 1,
        })),
      });
    }

    if (videoUrl) {
      await tx.gameVideo.create({
        data: {
          gameId: created.id,
          type: $Enums.VideoType.TRAILER,
          title: `${created.name} - Trailer`,
          url: videoUrl,
          thumbnail: "",
          order: 0,
        },
      });
    }

    if (downloads.length) {
      await tx.download.createMany({
        data: downloads.map((download, index) => ({
          gameId: created.id,
          store: download.store,
          type: $Enums.DownloadType.STORE,
          name: download.name,
          url: download.url,
          isOfficial: true,
          order: index,
        })),
      });
    }

    if (requirements) {
      for (const [kind, fields] of [
        ["MINIMUM", requirements.minimum],
        ["RECOMMENDED", requirements.recommended],
      ] as const) {
        if (fields) {
          await tx.systemRequirement.create({
            data: {
              gameId: created.id,
              kind: kind as $Enums.RequirementKind,
              os: fields.os ?? "",
              cpu: fields.cpu ?? "",
              gpu: fields.gpu ?? "",
              ram: fields.ram ?? "",
              vram: fields.vram ?? "",
              storage: fields.storage ?? "",
              directx: fields.directx ?? "",
            },
          });
        }
      }
    }

    await recomputeGenreCounts(tx);
    await createAuditLog(
      {
        actorId: options?.actorId ?? null,
        action: "CREATE_GAME",
        entityType: "Game",
        entityId: created.id,
        after: serializeForAudit({
          slug: input.slug,
          name: input.name,
          status: input.status,
          publishStatus: input.publishStatus,
        }),
      },
      tx,
    );
    return created;
  });
  return toView(row as unknown as GameRow, true);
}

export async function updateGame(
  id: string,
  input: UpdateGameInput,
  options?: { actorId?: string },
): Promise<Game> {
  const {
    genreIds,
    platformIds,
    tagIds,
    releaseDate,
    coverUrl,
    screenshots,
    videoUrl,
    downloads,
    requirements,
    ...rest
  } = input;
  const row = await db.$transaction(async (tx) => {
    const before = await tx.game.findUnique({
      where: { id },
      select: { id: true, slug: true, name: true, status: true, publishStatus: true },
    });
    if (!before) throw new Error("El juego no existe.");

    const data: Prisma.GameUpdateInput = { ...rest };
    if (releaseDate !== undefined) data.releaseDate = new Date(releaseDate);
    if (rest.publishStatus !== undefined) {
      data.publishedAt =
        rest.publishStatus === "PUBLISHED" ? new Date() : null;
    }
    if (genreIds !== undefined) {
      data.genres = { set: genreIds.map((genreId) => ({ id: genreId })) };
    }
    if (platformIds !== undefined) {
      data.platforms = { set: platformIds.map((platformId) => ({ id: platformId })) };
    }
    if (tagIds !== undefined) {
      data.tags = { set: tagIds.map((tagId) => ({ id: tagId })) };
    }

    const updated = await tx.game.update({
      where: { id },
      data,
      include: gameIncludes,
    });

    if (coverUrl !== undefined) {
      await tx.gameImage.deleteMany({ where: { gameId: id, type: $Enums.ImageType.COVER } });
      if (coverUrl) {
        await tx.gameImage.create({
          data: {
            gameId: id,
            type: $Enums.ImageType.COVER,
            url: coverUrl,
            alt: `Portada de ${before.name}`,
            order: 0,
          },
        });
      }
    }

    if (screenshots !== undefined) {
      await tx.gameImage.deleteMany({ where: { gameId: id, type: $Enums.ImageType.SCREENSHOT } });
      if (screenshots.length) {
        await tx.gameImage.createMany({
          data: screenshots.map((url, index) => ({
            gameId: id,
            type: $Enums.ImageType.SCREENSHOT,
            url,
            alt: `Captura ${index + 1} de ${before.name}`,
            order: index + 1,
          })),
        });
      }
    }

    if (videoUrl !== undefined) {
      await tx.gameVideo.deleteMany({ where: { gameId: id } });
      if (videoUrl) {
        await tx.gameVideo.create({
          data: {
            gameId: id,
            type: $Enums.VideoType.TRAILER,
            title: `${before.name} - Trailer`,
            url: videoUrl,
            thumbnail: "",
            order: 0,
          },
        });
      }
    }

    if (downloads !== undefined) {
      await tx.download.deleteMany({ where: { gameId: id } });
      if (downloads.length) {
        await tx.download.createMany({
          data: downloads.map((download, index) => ({
            gameId: id,
            store: download.store,
            type: $Enums.DownloadType.STORE,
            name: download.name,
            url: download.url,
            isOfficial: true,
            order: index,
          })),
        });
      }
    }

    if (requirements) {
      for (const [kind, fields] of [
        ["MINIMUM", requirements.minimum],
        ["RECOMMENDED", requirements.recommended],
      ] as const) {
        if (fields !== undefined) {
          await tx.systemRequirement.deleteMany({
            where: { gameId: id, kind: kind as $Enums.RequirementKind },
          });
          await tx.systemRequirement.create({
            data: {
              gameId: id,
              kind: kind as $Enums.RequirementKind,
              os: fields.os ?? "",
              cpu: fields.cpu ?? "",
              gpu: fields.gpu ?? "",
              ram: fields.ram ?? "",
              vram: fields.vram ?? "",
              storage: fields.storage ?? "",
              directx: fields.directx ?? "",
            },
          });
        }
      }
    }

    await recomputeGenreCounts(tx);
    await createAuditLog(
      {
        actorId: options?.actorId ?? null,
        action: "UPDATE_GAME",
        entityType: "Game",
        entityId: id,
        before: serializeForAudit(before),
        after: serializeForAudit(input),
      },
      tx,
    );
    return updated;
  });
  return toView(row as unknown as GameRow, true);
}

// Borrado físico: las relaciones dependientes usan onDelete Cascade en el schema.
export async function deleteGame(id: string, options?: { actorId?: string }): Promise<void> {
  await db.$transaction(async (tx) => {
    const before = await tx.game.findUnique({
      where: { id },
      select: { id: true, slug: true, name: true, publishStatus: true },
    });
    await tx.game.delete({ where: { id } });
    await recomputeGenreCounts(tx);
    await createAuditLog(
      {
        actorId: options?.actorId ?? null,
        action: "DELETE_GAME",
        entityType: "Game",
        entityId: id,
        before: serializeForAudit(before),
      },
      tx,
    );
  });
}

// publishStatus (editorial) es INDEPENDIENTE de GameStatus (fase comercial).
export async function publishGame(id: string, options?: { actorId?: string }): Promise<Game> {
  const row = await db.$transaction(async (tx) => {
    const updated = await tx.game.update({
      where: { id },
      data: { publishStatus: "PUBLISHED", publishedAt: new Date(), archivedAt: null },
      include: gameIncludes,
    });
    await recomputeGenreCounts(tx);
    await createAuditLog(
      {
        actorId: options?.actorId ?? null,
        action: "PUBLISH_GAME",
        entityType: "Game",
        entityId: id,
        after: serializeForAudit({ publishStatus: "PUBLISHED" }),
      },
      tx,
    );
    return updated;
  });
  return toView(row as unknown as GameRow, true);
}

export async function unpublishGame(id: string, options?: { actorId?: string }): Promise<Game> {
  const row = await db.$transaction(async (tx) => {
    const updated = await tx.game.update({
      where: { id },
      data: { publishStatus: "DRAFT", publishedAt: null },
      include: gameIncludes,
    });
    await recomputeGenreCounts(tx);
    await createAuditLog(
      {
        actorId: options?.actorId ?? null,
        action: "UPDATE_GAME",
        entityType: "Game",
        entityId: id,
        after: serializeForAudit({ publishStatus: "DRAFT" }),
      },
      tx,
    );
    return updated;
  });
  return toView(row as unknown as GameRow, true);
}

export async function archiveGame(id: string, options?: { actorId?: string }): Promise<Game> {
  const row = await db.$transaction(async (tx) => {
    const updated = await tx.game.update({
      where: { id },
      data: { publishStatus: "ARCHIVED", archivedAt: new Date() },
      include: gameIncludes,
    });
    await recomputeGenreCounts(tx);
    await createAuditLog(
      {
        actorId: options?.actorId ?? null,
        action: "ARCHIVE_GAME",
        entityType: "Game",
        entityId: id,
        after: serializeForAudit({ publishStatus: "ARCHIVED" }),
      },
      tx,
    );
    return updated;
  });
  return toView(row as unknown as GameRow, true);
}

// ============================== RECURSOS ASOCIADOS ==============================

export interface GameImageItem {
  id: string;
  type: string;
  url: string;
  alt: string | null;
  width: number | null;
  height: number | null;
  order: number;
}

// GameImage es la fuente canónica de COVER/BANNER/SCREENSHOT/GALLERY.
export async function getGameImages(gameId: string): Promise<GameImageItem[]> {
  const rows = await db.gameImage.findMany({
    where: { gameId },
    orderBy: [{ type: "asc" }, { order: "asc" }],
  });
  return rows.map((row) => ({
    id: row.id,
    type: row.type,
    url: row.url,
    alt: row.alt,
    width: row.width,
    height: row.height,
    order: row.order,
  }));
}

export interface GameVideoItem {
  id: string;
  type: string;
  title: string;
  url: string;
  thumbnail: string;
  provider: string | null;
  order: number;
}

export async function getGameVideos(gameId: string): Promise<GameVideoItem[]> {
  const rows = await db.gameVideo.findMany({
    where: { gameId },
    orderBy: { order: "asc" },
  });
  return rows.map((row) => ({
    id: row.id,
    type: row.type,
    title: row.title,
    url: row.url,
    thumbnail: row.thumbnail,
    provider: row.provider,
    order: row.order,
  }));
}

export interface GameRequirementItem {
  id: string;
  kind: string;
  os: string;
  cpu: string;
  gpu: string;
  ram: string;
  vram: string;
  storage: string;
  directx: string;
}

export async function getGameRequirements(gameId: string): Promise<GameRequirementItem[]> {
  const rows = await db.systemRequirement.findMany({ where: { gameId } });
  return rows.map((row) => ({
    id: row.id,
    kind: row.kind,
    os: row.os,
    cpu: row.cpu,
    gpu: row.gpu,
    ram: row.ram,
    vram: row.vram,
    storage: row.storage,
    directx: row.directx,
  }));
}

export async function getGameDownloads(gameId: string) {
  return getDownloadsForGame(gameId);
}

export interface GameStats {
  gameId: string;
  rating: number;
  ratingCount: number;
  favoriteCount: number;
  commentCount: number;
  viewCount: number;
  distribution: Array<{ value: number; count: number }>;
}

export async function getGameStats(gameId: string): Promise<GameStats> {
  const [game, favorites, comments, views, distribution] = await Promise.all([
    db.game.findUnique({
      where: { id: gameId },
      select: { rating: true, ratingCount: true },
    }),
    db.favorite.count({ where: { gameId } }),
    db.comment.count({ where: { gameId, deletedAt: null } }),
    db.gameView.aggregate({ where: { gameId }, _sum: { views: true } }),
    db.gameRating.groupBy({
      by: ["value"],
      where: { gameId },
      _count: { value: true },
    }),
  ]);

  return {
    gameId,
    rating: game?.rating ?? 0,
    ratingCount: game?.ratingCount ?? 0,
    favoriteCount: favorites,
    commentCount: comments,
    viewCount: views._sum.views ?? 0,
    distribution: distribution.map((item) => ({
      value: item.value,
      count: item._count.value,
    })),
  };
}

export async function createGameImage(
  input: CreateGameImageInput,
  options?: { actorId?: string },
): Promise<GameImageItem> {
  const row = await db.$transaction(async (tx) => {
    const created = await tx.gameImage.create({ data: input });
    await createAuditLog(
      {
        actorId: options?.actorId ?? null,
        action: "UPLOAD_MEDIA",
        entityType: "GameImage",
        entityId: created.id,
        after: serializeForAudit({ type: input.type, url: input.url, order: input.order }),
      },
      tx,
    );
    return created;
  });
  return {
    id: row.id,
    type: row.type,
    url: row.url,
    alt: row.alt,
    width: row.width,
    height: row.height,
    order: row.order,
  };
}

export async function updateGameImage(
  id: string,
  input: UpdateGameImageInput,
  options?: { actorId?: string },
): Promise<GameImageItem> {
  const row = await db.$transaction(async (tx) => {
    const updated = await tx.gameImage.update({ where: { id }, data: input });
    await createAuditLog(
      {
        actorId: options?.actorId ?? null,
        action: "REPLACE_MEDIA",
        entityType: "GameImage",
        entityId: id,
        after: serializeForAudit(input),
      },
      tx,
    );
    return updated;
  });
  return {
    id: row.id,
    type: row.type,
    url: row.url,
    alt: row.alt,
    width: row.width,
    height: row.height,
    order: row.order,
  };
}

export async function deleteGameImage(id: string, options?: { actorId?: string }): Promise<void> {
  await db.$transaction(async (tx) => {
    await tx.gameImage.delete({ where: { id } });
    await createAuditLog(
      {
        actorId: options?.actorId ?? null,
        action: "DELETE_MEDIA",
        entityType: "GameImage",
        entityId: id,
      },
      tx,
    );
  });
}


