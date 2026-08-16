import {
  GameStatus,
  GamePublishStatus,
  PricingModel,
  RecommendationTier,
  ImageType,
  VideoType,
  RequirementKind,
  DownloadStore,
  DownloadType,
  ArticleStatus,
  Role,
} from "../../src/generated/prisma/client";
import type { PrismaClient } from "../../src/generated/prisma/client";
import { games } from "./mock/games";
import { articles } from "./mock/articles";
import { comments } from "./mock/comments";
import { users } from "./mock/users";

const tierMap: Record<string, RecommendationTier> = {
  excelente: RecommendationTier.EXCELENTE,
  bueno: RecommendationTier.BUENO,
  jugable: RecommendationTier.ACEPTABLE,
  limitado: RecommendationTier.NO_RECOMENDADO,
  "no-recomendado": RecommendationTier.NO_RECOMENDADO,
};

const statusMap: Record<string, GameStatus> = {
  released: GameStatus.RELEASED,
  "early-access": GameStatus.EARLY_ACCESS,
  upcoming: GameStatus.UPCOMING,
  abandoned: GameStatus.ABANDONED,
  demo: GameStatus.DEMO,
};

const pricingMap: Record<string, PricingModel> = {
  paid: PricingModel.PAID,
  "free-to-play": PricingModel.FREE_TO_PLAY,
  free: PricingModel.FREE,
  demo: PricingModel.DEMO,
};

const videoTypeMap: Record<string, VideoType> = {
  trailer: VideoType.TRAILER,
  gameplay: VideoType.GAMEPLAY,
  review: VideoType.REVIEW,
  developer: VideoType.DEVELOPER,
  other: VideoType.OTHER,
};

const storeMap: Record<string, DownloadStore> = {
  Steam: DownloadStore.STEAM,
  GOG: DownloadStore.GOG,
  Epic: DownloadStore.EPIC,
  Web: DownloadStore.OFFICIAL,
  Launcher: DownloadStore.OFFICIAL,
};

function downloadTypeFor(store: string): DownloadType {
  if (store === "Steam" || store === "GOG" || store === "Epic") return DownloadType.STORE;
  if (store === "Launcher") return DownloadType.CLIENT;
  return DownloadType.OTHER;
}

// Comentarios del mock asignados a juegos concretos (c1 + respuestas → core-keeper;
// c2, c3 → phasmophobia).
const commentGameByMockId: Record<string, string> = {
  c1: "core-keeper",
  c1r1: "core-keeper",
  c1r2: "core-keeper",
  c2: "phasmophobia",
  c3: "phasmophobia",
};

const ratingSeeds: Array<{ username: string; gameSlug: string; value: number }> = [
  { username: "nebulux", gameSlug: "core-keeper", value: 4 },
  { username: "nebulux", gameSlug: "hades", value: 5 },
  { username: "vox_magazine", gameSlug: "stardew-valley", value: 5 },
  { username: "vox_magazine", gameSlug: "factorio", value: 5 },
  { username: "lunar_prism", gameSlug: "hollow-knight", value: 5 },
  { username: "lunar_prism", gameSlug: "balatro", value: 5 },
  { username: "darkpixel", gameSlug: "phasmophobia", value: 4 },
  { username: "casual_sam", gameSlug: "hades", value: 5 },
  { username: "build_bot", gameSlug: "factorio", value: 5 },
  { username: "build_bot", gameSlug: "noita", value: 4 },
  { username: "ghost_techo", gameSlug: "phasmophobia", value: 5 },
];

const favoriteSeeds: Array<{ username: string; gameSlug: string }> = [
  { username: "nebulux", gameSlug: "core-keeper" },
  { username: "nebulux", gameSlug: "terraria" },
  { username: "lunar_prism", gameSlug: "balatro" },
  { username: "darkpixel", gameSlug: "phasmophobia" },
  { username: "casual_sam", gameSlug: "hades" },
  { username: "casual_sam", gameSlug: "stardew-valley" },
  { username: "build_bot", gameSlug: "factorio" },
  { username: "build_bot", gameSlug: "satisfactory" },
  { username: "ghost_techo", gameSlug: "hollow-knight" },
];

const commentIds = ["c1", "c1r1", "c1r2", "c2", "c3"];

const demoRoleMap: Record<string, Role> = {
  admin: Role.ADMIN,
  moderator: Role.MODERATOR,
  user: Role.USER,
};

export async function seedDemo(prisma: PrismaClient): Promise<void> {
  console.log("🎮 Sembrando datos demo...");

  // 0. Usuarios demo (upsert por username) para que el seed demo funcione en
  //    solitario, sin depender del seed base.
  for (const user of users) {
    const email = `${user.username}@example.com`;
    await prisma.user.upsert({
      where: { username: user.username },
      update: {
        name: user.name,
        email,
        image: user.avatar,
        bio: user.bio ?? null,
        role: demoRoleMap[user.role],
      },
      create: {
        username: user.username,
        name: user.name,
        email,
        image: user.avatar,
        bio: user.bio ?? null,
        role: demoRoleMap[user.role],
      },
    });
  }

  const userIdByUsername = new Map<string, string>();
  const userRows = await prisma.user.findMany({ select: { id: true, username: true } });
  for (const user of userRows) userIdByUsername.set(user.username, user.id);

  // 1. Tags (derivados de los artículos; upsert por slug)
  const tagSlugs = [...new Set(articles.flatMap((article) => article.tags))];
  for (const slug of tagSlugs) {
    const name = slug.replace(/-/g, " ");
    await prisma.tag.upsert({
      where: { slug },
      update: { name },
      create: { slug, name },
    });
  }

  // 2. Juegos (upsert por slug) + hijos (deleteMany + createMany por gameId)
  const gameIdBySlug = new Map<string, string>();
  const platformRows = await prisma.platform.findMany();
  const platformIdBySlug = new Map(platformRows.map((p) => [p.slug, p.id]));
  const pcPlatformId = platformIdBySlug.get("pc") ?? null;

  for (const game of games) {
    const record = await prisma.game.upsert({
      where: { slug: game.slug },
      update: {
        name: game.name,
        description: game.description,
        longDescription: game.longDescription,
        developer: game.developer,
        publisher: game.publisher,
        releaseDate: new Date(game.releaseDate),
        rating: game.rating,
        ratingCount: game.ratingCount,
        status: statusMap[game.status],
        publishStatus: GamePublishStatus.PUBLISHED,
        publishedAt: new Date(game.releaseDate),
        pricingModel: pricingMap[game.pricingModel],
        isSingleplayer: game.isSingleplayer,
        isMultiplayer: game.isMultiplayer,
        isIndie: game.isIndie,
        recommendedTier: tierMap[game.recommendedTier],
        features: game.features,
        genres: { set: game.genres.map((slug) => ({ slug })) },
        platforms: { set: game.platforms.map((slug) => ({ slug })) },
      },
      create: {
        slug: game.slug,
        name: game.name,
        description: game.description,
        longDescription: game.longDescription,
        developer: game.developer,
        publisher: game.publisher,
        releaseDate: new Date(game.releaseDate),
        rating: game.rating,
        ratingCount: game.ratingCount,
        status: statusMap[game.status],
        publishStatus: GamePublishStatus.PUBLISHED,
        publishedAt: new Date(game.releaseDate),
        pricingModel: pricingMap[game.pricingModel],
        isSingleplayer: game.isSingleplayer,
        isMultiplayer: game.isMultiplayer,
        isIndie: game.isIndie,
        recommendedTier: tierMap[game.recommendedTier],
        features: game.features,
        genres: { connect: game.genres.map((slug) => ({ slug })) },
        platforms: { connect: game.platforms.map((slug) => ({ slug })) },
      },
    });
    const gameId = record.id;
    gameIdBySlug.set(game.slug, gameId);

    await prisma.gameImage.deleteMany({ where: { gameId } });
    await prisma.gameImage.createMany({
      data: [
        {
          gameId,
          type: ImageType.COVER,
          url: game.cover,
          alt: `Portada de ${game.name}`,
          order: 0,
        },
        {
          gameId,
          type: ImageType.BANNER,
          url: game.banner,
          alt: `Banner de ${game.name}`,
          order: 0,
        },
        ...game.screenshots.map((url, index) => ({
          gameId,
          type: ImageType.SCREENSHOT,
          url,
          alt: `Captura ${index + 1} de ${game.name}`,
          order: index + 1,
        })),
      ],
    });

    await prisma.gameVideo.deleteMany({ where: { gameId } });
    await prisma.gameVideo.createMany({
      data: game.videos.map((video, index) => ({
        gameId,
        type: videoTypeMap[video.type],
        title: video.title,
        url: video.url,
        thumbnail: video.thumbnail,
        provider: null,
        order: index,
      })),
    });

    await prisma.systemRequirement.deleteMany({ where: { gameId } });
    await prisma.systemRequirement.createMany({
      data: [
        { gameId, kind: RequirementKind.MINIMUM, ...game.requirements.minimum },
        { gameId, kind: RequirementKind.RECOMMENDED, ...game.requirements.recommended },
      ],
    });

    await prisma.download.deleteMany({ where: { gameId } });
    await prisma.download.createMany({
      data: game.downloads.map((download, index) => ({
        gameId,
        store: storeMap[download.platform] ?? DownloadStore.OTHER,
        type: downloadTypeFor(download.platform),
        name: download.name,
        url: download.url,
        platformId:
          (download.platform === "Steam" || download.platform === "GOG") &&
          game.platforms.includes("pc")
            ? pcPlatformId
            : null,
        version: download.version === "-" ? null : download.version,
        size: download.size === "-" ? null : download.size,
        isOfficial: download.isOfficial,
        order: index,
      })),
    });
  }

  // 3. Juegos similares (derivados por géneros compartidos; gameId = id menor del par)
  const similar: Array<{ gameId: string; relatedGameId: string; weight: number; order: number }> =
    [];
  for (const game of games) {
    const related = games
      .filter(
        (other) =>
          other.id !== game.id && other.genres.some((genre) => game.genres.includes(genre)),
      )
      .slice(0, 6);
    related.forEach((rel, index) => {
      const a = gameIdBySlug.get(game.slug)!;
      const b = gameIdBySlug.get(rel.slug)!;
      const [gameId, relatedGameId] = [a, b].sort();
      const weight = game.genres.filter((genre) => rel.genres.includes(genre)).length;
      similar.push({ gameId, relatedGameId, weight, order: index });
    });
  }
  const seenPairs = new Set<string>();
  const uniqueSimilar = similar.filter((pair) => {
    const key = `${pair.gameId}|${pair.relatedGameId}`;
    if (seenPairs.has(key)) return false;
    seenPairs.add(key);
    return true;
  });
  await prisma.gameSimilar.deleteMany({});
  await prisma.gameSimilar.createMany({ data: uniqueSimilar });

  // 4. Ratings (upsert por userId+gameId)
  for (const seed of ratingSeeds) {
    await prisma.gameRating.upsert({
      where: {
        userId_gameId: {
          userId: userIdByUsername.get(seed.username)!,
          gameId: gameIdBySlug.get(seed.gameSlug)!,
        },
      },
      update: { value: seed.value },
      create: {
        userId: userIdByUsername.get(seed.username)!,
        gameId: gameIdBySlug.get(seed.gameSlug)!,
        value: seed.value,
      },
    });
  }

  // 5. Favoritos (upsert por userId+gameId)
  for (const seed of favoriteSeeds) {
    await prisma.favorite.upsert({
      where: {
        userId_gameId: {
          userId: userIdByUsername.get(seed.username)!,
          gameId: gameIdBySlug.get(seed.gameSlug)!,
        },
      },
      update: {},
      create: {
        userId: userIdByUsername.get(seed.username)!,
        gameId: gameIdBySlug.get(seed.gameSlug)!,
      },
    });
  }

  // 6. Comentarios (deleteMany de ids sembrados + create con ids explícitos)
  await prisma.comment.deleteMany({ where: { id: { in: commentIds } } });
  for (const comment of comments) {
    const record = await prisma.comment.create({
      data: {
        id: comment.id,
        gameId: gameIdBySlug.get(commentGameByMockId[comment.id])!,
        authorId: userIdByUsername.get(comment.user.username)!,
        content: comment.content,
        likes: comment.likes,
        createdAt: new Date(comment.date),
        updatedAt: new Date(comment.date),
      },
    });
    for (const reply of comment.replies) {
      await prisma.comment.create({
        data: {
          id: reply.id,
          gameId: gameIdBySlug.get(commentGameByMockId[reply.id])!,
          parentId: record.id,
          authorId: userIdByUsername.get(reply.user.username)!,
          content: reply.content,
          likes: reply.likes,
          createdAt: new Date(reply.date),
          updatedAt: new Date(reply.date),
        },
      });
    }
  }

  // 7. Artículos (upsert por slug; tags y relatedGames por slug)
  for (const article of articles) {
    const readTime = parseInt(article.readTime, 10);
    await prisma.article.upsert({
      where: { slug: article.slug },
      update: {
        title: article.title,
        excerpt: article.excerpt,
        image: article.image,
        category: article.category,
        content: article.content,
        readTime,
        status: ArticleStatus.PUBLISHED,
        publishedAt: new Date(article.publishedAt),
        authorId: userIdByUsername.get(article.author.username)!,
        tags: { set: article.tags.map((slug) => ({ slug })) },
        relatedGames: { set: article.relatedGames.map((slug) => ({ slug })) },
      },
      create: {
        slug: article.slug,
        title: article.title,
        excerpt: article.excerpt,
        image: article.image,
        category: article.category,
        content: article.content,
        readTime,
        status: ArticleStatus.PUBLISHED,
        publishedAt: new Date(article.publishedAt),
        authorId: userIdByUsername.get(article.author.username)!,
        tags: { connect: article.tags.map((slug) => ({ slug })) },
        relatedGames: { connect: article.relatedGames.map((slug) => ({ slug })) },
      },
    });
  }
}
