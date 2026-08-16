import type { Article } from "@/types/article";
import type { Comment } from "@/types/comment";
import type {
  Game,
  GameDownload,
  GameStatus,
  GameVideo,
  PricingModel,
  RequirementSet,
  StarDistribution,
  VideoType,
} from "@/types/game";
import type { Genre } from "@/types/genre";
import type { Platform } from "@/types/platform";
import type { User, UserRole, UserSummary } from "@/types/user";

export interface GenreRow {
  id: string;
  slug: string;
  name: string;
  image: string | null;
  description: string;
  accentFrom: string;
  accentTo: string;
  patternStyle: string | null;
  patternSeed: number | null;
  gameCount: number;
}

export interface PlatformRow {
  id: string;
  slug: string;
  name: string;
  shortName: string;
}

export interface GameImageRow {
  type: string;
  url: string;
  alt?: string | null;
  order: number;
}

export interface GameVideoRow {
  id: string;
  type: string;
  title: string;
  url: string;
  thumbnail: string;
}

export interface GameDownloadRow {
  id: string;
  store: string;
  name: string;
  url: string;
  version: string | null;
  size: string | null;
  isOfficial: boolean;
}

export interface GameRequirementRow {
  kind: string;
  os: string;
  cpu: string;
  gpu: string;
  ram: string;
  vram: string;
  storage: string;
  directx: string;
}

export interface GameRow {
  id: string;
  slug: string;
  name: string;
  description: string;
  longDescription: string;
  developer: string;
  publisher: string;
  releaseDate: Date;
  rating: number;
  ratingCount: number;
  status: string;
  pricingModel: string;
  isSingleplayer: boolean;
  isMultiplayer: boolean;
  isIndie: boolean;
  recommendedTier: string;
  features: string[];
  genres: GenreRow[];
  platforms: PlatformRow[];
  images: GameImageRow[];
  videos: GameVideoRow[];
  downloads: GameDownloadRow[];
  requirements: GameRequirementRow[];
  zipPassword: string | null;
}

export interface ArticleRow {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  category: string;
  content: unknown;
  readTime: number;
  publishedAt: Date;
  createdAt: Date;
  author: UserRow;
  tags: { id: string; slug: string; name: string }[];
  relatedGames: { id: string; slug: string; name: string }[];
}

export interface UserRow {
  id: string;
  username: string;
  name: string;
  image?: string | null;
  cover?: string | null;
  bio?: string | null;
  role: string;
  reputation?: number;
  createdAt?: Date;
}

export interface CommentRow {
  id: string;
  parentId?: string | null;
  content: string;
  likes: number;
  likedByViewer?: boolean;
  edited: boolean;
  createdAt: Date;
  author: UserRow;
  replies: CommentRow[];
  gameRating?: { value: number } | null;
}

const GAME_STATUS_MAP: Record<string, GameStatus> = {
  RELEASED: "released",
  EARLY_ACCESS: "early-access",
  UPCOMING: "upcoming",
  ABANDONED: "abandoned",
  DEMO: "demo",
};

const PRICING_MODEL_MAP: Record<string, PricingModel> = {
  FREE: "free",
  PAID: "paid",
  FREE_TO_PLAY: "free-to-play",
  DEMO: "demo",
};

const RECOMMENDATION_TIER_MAP: Record<string, Game["recommendedTier"]> = {
  EXCELENTE: "excelente",
  BUENO: "bueno",
  ACEPTABLE: "jugable",
  NO_RECOMENDADO: "no-recomendado",
};

const VIDEO_TYPE_MAP: Record<string, VideoType> = {
  TRAILER: "trailer",
  GAMEPLAY: "gameplay",
  REVIEW: "review",
  DEVELOPER: "developer",
  OTHER: "other",
};

const STORE_LABEL_MAP: Record<string, string> = {
  STEAM: "Steam",
  GOG: "GOG",
  EPIC: "Epic",
  MICROSOFT: "Microsoft Store",
  PLAYSTATION: "PlayStation Store",
  XBOX: "Microsoft Store",
  NINTENDO: "Nintendo eShop",
  OFFICIAL: "Web",
  OTHER: "Otro",
};

const USER_ROLE_MAP: Record<string, UserRole> = {
  USER: "user",
  MODERATOR: "moderator",
  ADMIN: "admin",
};

export function toISODate(date: Date): string {
  const y = date.getUTCFullYear();
  const m = `${date.getUTCMonth() + 1}`.padStart(2, "0");
  const d = `${date.getUTCDate()}`.padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function toGenreView(genre: GenreRow): Genre {
  return {
    id: genre.id,
    slug: genre.slug,
    name: genre.name,
    image: genre.image,
    description: genre.description,
    accentFrom: genre.accentFrom,
    accentTo: genre.accentTo,
    patternStyle: (genre.patternStyle as Genre["patternStyle"]) ?? null,
    patternSeed: genre.patternSeed ?? null,
    gameCount: genre.gameCount,
  };
}

export function toPlatformView(platform: PlatformRow): Platform {
  return {
    id: platform.id,
    slug: platform.slug,
    name: platform.name,
    shortName: platform.shortName,
  };
}

export function toUserSummaryView(user: UserRow): UserSummary {
  return {
    id: user.id,
    username: user.username,
    name: user.name,
    avatar: user.image ?? "",
  };
}

export function toUserView(user: UserRow): User {
  return {
    id: user.id,
    username: user.username,
    name: user.name,
    avatar: user.image ?? "",
    role: USER_ROLE_MAP[user.role] ?? "user",
    bio: user.bio ?? undefined,
    cover: user.cover ?? undefined,
    reputation: user.reputation ?? 0,
    createdAt: user.createdAt ? user.createdAt.toISOString() : undefined,
  };
}

function toGameVideoView(video: GameVideoRow): GameVideo {
  return {
    id: video.id,
    type: VIDEO_TYPE_MAP[video.type] ?? "other",
    title: video.title,
    url: video.url,
    thumbnail: video.thumbnail,
  };
}

function toGameDownloadView(download: GameDownloadRow): GameDownload {
  return {
    id: download.id,
    platform: STORE_LABEL_MAP[download.store] ?? download.store,
    name: download.name,
    url: download.url,
    version: download.version ?? "-",
    size: download.size ?? "-",
    isOfficial: download.isOfficial,
  };
}

const EMPTY_REQUIREMENTS: RequirementSet = {
  os: "",
  cpu: "",
  gpu: "",
  ram: "",
  vram: "",
  storage: "",
  directx: "",
};

function toRequirementSet(row?: GameRequirementRow): RequirementSet {
  if (!row) return { ...EMPTY_REQUIREMENTS };
  return {
    os: row.os,
    cpu: row.cpu,
    gpu: row.gpu,
    ram: row.ram,
    vram: row.vram,
    storage: row.storage,
    directx: row.directx,
  };
}

function toStarDistribution(
  breakdown: Array<{ value: number; count: number }>,
  ratingCount: number,
): StarDistribution[] {
  if (ratingCount <= 0 || breakdown.length === 0) return [];
  const byStars = new Map<number, number>();
  let total = 0;
  for (const row of breakdown) {
    byStars.set(row.value, row.count);
    total += row.count;
  }
  if (total <= 0) return [];
  return [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    percentage: Math.round(((byStars.get(stars) ?? 0) / total) * 100),
  }));
}

export function toGameView(
  game: GameRow,
  starBreakdown: Array<{ value: number; count: number }> = [],
): Game {
  const cover = game.images.find((image) => image.type === "COVER")?.url ?? "";
  const banner = game.images.find((image) => image.type === "BANNER")?.url ?? cover;
  const screenshots = game.images
    .filter((image) => image.type === "SCREENSHOT")
    .sort((a, b) => a.order - b.order)
    .map((image) => image.url);

  return {
    id: game.id,
    slug: game.slug,
    name: game.name,
    description: game.description,
    longDescription: game.longDescription,
    cover,
    banner,
    screenshots,
    videos: game.videos.map(toGameVideoView),
    genres: game.genres.map((genre) => genre.slug),
    platforms: game.platforms.map((platform) => platform.slug),
    genreNames: game.genres.map((genre) => ({ slug: genre.slug, name: genre.name })),
    platformNames: game.platforms.map((platform) => ({
      slug: platform.slug,
      name: platform.shortName,
    })),
    developer: game.developer,
    publisher: game.publisher,
    releaseDate: toISODate(game.releaseDate),
    releaseYear: game.releaseDate.getUTCFullYear(),
    rating: game.rating,
    ratingCount: game.ratingCount,
    starDistribution: toStarDistribution(starBreakdown, game.ratingCount),
    status: GAME_STATUS_MAP[game.status] ?? "released",
    pricingModel: PRICING_MODEL_MAP[game.pricingModel] ?? "free",
    isSingleplayer: game.isSingleplayer,
    isMultiplayer: game.isMultiplayer,
    isIndie: game.isIndie,
    requirements: {
      minimum: toRequirementSet(game.requirements.find((req) => req.kind === "MINIMUM")),
      recommended: toRequirementSet(game.requirements.find((req) => req.kind === "RECOMMENDED")),
    },
    downloads: game.downloads.map(toGameDownloadView),
    zipPassword: game.zipPassword,
    features: game.features,
    recommendedTier: RECOMMENDATION_TIER_MAP[game.recommendedTier] ?? "jugable",
  };
}

export function toArticleView(article: ArticleRow): Article {
  return {
    id: article.id,
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt,
    image: article.image,
    category: article.category,
    author: toUserSummaryView(article.author),
    publishedAt: toISODate(article.publishedAt ?? article.createdAt),
    readTime: `${article.readTime} min`,
    tags: article.tags.map((tag) => tag.slug),
    content: Array.isArray(article.content) ? (article.content as string[]) : [],
    relatedGames: article.relatedGames.map((game) => game.slug),
  };
}

export function toCommentView(comment: CommentRow): Comment {
  return {
    id: comment.id,
    user: toUserSummaryView(comment.author),
    date: toISODate(comment.createdAt),
    content: comment.content,
    likes: comment.likes,
    likedByViewer: comment.likedByViewer,
    rating: comment.gameRating?.value,
    edited: comment.edited,
    replies: comment.replies.map(toCommentView),
  };
}
