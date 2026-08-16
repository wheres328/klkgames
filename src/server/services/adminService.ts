import { db } from "@/lib/db";
import { Prisma, $Enums } from "@/generated/prisma/client";
import { listAuditLogs } from "@/server/services/auditService";

// ============================== GAMES ==============================

export interface AdminGameListItem {
  id: string;
  slug: string;
  name: string;
  cover: string | null;
  status: string;
  publishStatus: string;
  pricingModel: string;
  rating: number;
  ratingCount: number;
  commentCount: number;
  imageCount: number;
  createdAt: Date;
  publishedAt: Date | null;
  genres: string[];
}

export interface AdminGameListResult {
  items: AdminGameListItem[];
  total: number;
  totalPages: number;
  currentPage: number;
}

export async function listGamesAdmin(
  options: {
    q?: string;
    publishStatus?: string;
    page?: number;
    pageSize?: number;
  } = {},
): Promise<AdminGameListResult> {
  const { q, publishStatus, page = 1, pageSize = 20 } = options;
  const where: Prisma.GameWhereInput = {
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" as const } },
            { developer: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...(publishStatus === "DRAFT" || publishStatus === "PUBLISHED" || publishStatus === "ARCHIVED"
      ? { publishStatus: publishStatus as "DRAFT" | "PUBLISHED" | "ARCHIVED" }
      : {}),
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
      select: {
        id: true,
        slug: true,
        name: true,
        status: true,
        publishStatus: true,
        pricingModel: true,
        rating: true,
        ratingCount: true,
        createdAt: true,
        publishedAt: true,
        genres: { select: { name: true } },
        images: { where: { type: "COVER" }, select: { url: true }, take: 1 },
        _count: {
          select: {
            comments: { where: { deletedAt: null } },
            images: true,
          },
        },
      },
    }),
  ]);

  return {
    items: rows.map((row) => ({
      id: row.id,
      slug: row.slug,
      name: row.name,
      cover: row.images[0]?.url ?? null,
      status: row.status,
      publishStatus: row.publishStatus,
      pricingModel: row.pricingModel,
      rating: row.rating,
      ratingCount: row.ratingCount,
      commentCount: row._count.comments,
      imageCount: row._count.images,
      createdAt: row.createdAt,
      publishedAt: row.publishedAt,
      genres: row.genres.map((genre) => genre.name),
    })),
    total,
    totalPages: Math.max(1, Math.ceil(total / safePageSize)),
    currentPage,
  };
}

export interface AdminRequirementSet {
  os: string;
  cpu: string;
  gpu: string;
  ram: string;
  vram: string;
  storage: string;
  directx: string;
}

export interface AdminGame {
  id: string;
  slug: string;
  name: string;
  description: string;
  longDescription: string;
  developer: string;
  publisher: string;
  releaseDate: Date;
  status: string;
  publishStatus: string;
  coverUrl: string | null;
  screenshots: string[];
  videoUrl: string | null;
  downloads: Array<{ id: string; store: string; name: string; url: string }>;
  requirements: {
    minimum: AdminRequirementSet | null;
    recommended: AdminRequirementSet | null;
  };
  zipPassword: string | null;
  genreIds: string[];
  platformIds: string[];
  tagIds: string[];
}

export async function getGameAdmin(id: string): Promise<AdminGame | null> {
  const row = await db.game.findUnique({
    where: { id },
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      longDescription: true,
      developer: true,
      publisher: true,
      releaseDate: true,
      status: true,
      publishStatus: true,
      zipPassword: true,
      genres: { select: { id: true } },
      platforms: { select: { id: true } },
      tags: { select: { id: true } },
      images: {
        where: {
          OR: [{ type: "COVER" }, { type: "SCREENSHOT" }],
        },
        orderBy: { order: "asc" },
        select: { type: true, url: true },
      },
      videos: { orderBy: { order: "asc" }, take: 1, select: { url: true } },
      downloads: {
        orderBy: { order: "asc" },
        select: { id: true, store: true, name: true, url: true },
      },
      requirements: true,
    },
  });
  if (!row) return null;

  const toRequirementSet = (kind: "MINIMUM" | "RECOMMENDED"): AdminRequirementSet | null => {
    const req = row.requirements.find((item) => item.kind === kind);
    if (!req) return null;
    return {
      os: req.os,
      cpu: req.cpu,
      gpu: req.gpu,
      ram: req.ram,
      vram: req.vram,
      storage: req.storage,
      directx: req.directx,
    };
  };

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    longDescription: row.longDescription,
    developer: row.developer,
    publisher: row.publisher,
    releaseDate: row.releaseDate,
    status: row.status,
    publishStatus: row.publishStatus,
    coverUrl: row.images.find((image) => image.type === "COVER")?.url ?? null,
    screenshots: row.images
      .filter((image) => image.type === "SCREENSHOT")
      .map((image) => image.url),
    videoUrl: row.videos[0]?.url ?? null,
    downloads: row.downloads.map((download) => ({
      id: download.id,
      store: download.store,
      name: download.name,
      url: download.url,
    })),
    requirements: {
      minimum: toRequirementSet("MINIMUM"),
      recommended: toRequirementSet("RECOMMENDED"),
    },
    zipPassword: row.zipPassword,
    genreIds: row.genres.map((genre) => genre.id),
    platformIds: row.platforms.map((platform) => platform.id),
    tagIds: row.tags.map((tag) => tag.id),
  };
}

// ============================== ARTICLES ==============================

export interface AdminArticleListItem {
  id: string;
  slug: string;
  title: string;
  status: string;
  category: string;
  readTime: number;
  author: string;
  publishedAt: Date;
  commentCount: number;
}

export interface AdminArticleListResult {
  items: AdminArticleListItem[];
  total: number;
  totalPages: number;
  currentPage: number;
}

export async function listArticlesAdmin(
  options: {
    q?: string;
    status?: string;
    page?: number;
    pageSize?: number;
  } = {},
): Promise<AdminArticleListResult> {
  const { q, status, page = 1, pageSize = 20 } = options;
  const where = {
    ...(q
      ? {
          OR: [
            { title: { contains: q, mode: "insensitive" as const } },
            { excerpt: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...(status === "DRAFT" || status === "PUBLISHED" || status === "ARCHIVED"
      ? { status: status as "DRAFT" | "PUBLISHED" | "ARCHIVED" }
      : {}),
  };

  const currentPage = Math.max(1, page);
  const safePageSize = Math.min(Math.max(1, pageSize), 100);

  const [total, rows] = await db.$transaction([
    db.article.count({ where }),
    db.article.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      skip: (currentPage - 1) * safePageSize,
      take: safePageSize,
      select: {
        id: true,
        slug: true,
        title: true,
        status: true,
        category: true,
        readTime: true,
        publishedAt: true,
        author: { select: { username: true } },
        _count: { select: { comments: { where: { deletedAt: null } } } },
      },
    }),
  ]);

  return {
    items: rows.map((row) => ({
      id: row.id,
      slug: row.slug,
      title: row.title,
      status: row.status,
      category: row.category,
      readTime: row.readTime,
      author: row.author.username,
      publishedAt: row.publishedAt,
      commentCount: row._count.comments,
    })),
    total,
    totalPages: Math.max(1, Math.ceil(total / safePageSize)),
    currentPage,
  };
}

export interface AdminArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  category: string;
  content: string[];
  readTime: number;
  status: string;
  authorId: string;
  seoTitle: string | null;
  seoDescription: string | null;
  tagIds: string[];
  relatedGameIds: string[];
}

export async function getArticleAdmin(id: string): Promise<AdminArticle | null> {
  const row = await db.article.findUnique({
    where: { id },
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      image: true,
      category: true,
      content: true,
      readTime: true,
      status: true,
      authorId: true,
      seoTitle: true,
      seoDescription: true,
      tags: { select: { id: true } },
      relatedGames: { select: { id: true } },
    },
  });
  if (!row) return null;

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    image: row.image,
    category: row.category,
    content: Array.isArray(row.content) ? (row.content as string[]) : [],
    readTime: row.readTime,
    status: row.status,
    authorId: row.authorId,
    seoTitle: row.seoTitle,
    seoDescription: row.seoDescription,
    tagIds: row.tags.map((tag) => tag.id),
    relatedGameIds: row.relatedGames.map((game) => game.id),
  };
}

// ============================== TAGS ==============================

export interface AdminTag {
  id: string;
  slug: string;
  name: string;
}

export async function listTags(): Promise<AdminTag[]> {
  return db.tag.findMany({
    orderBy: { name: "asc" },
    select: { id: true, slug: true, name: true },
  });
}

// ============================== USERS ==============================

export interface AdminUserListItem {
  id: string;
  username: string;
  name: string;
  email: string;
  role: string;
  reputation: number;
  rank: { id: string; name: string; color: string | null } | null;
  createdAt: Date;
}

export async function listUsersAdmin(
  options: {
    q?: string;
    page?: number;
    pageSize?: number;
  } = {},
): Promise<{ items: AdminUserListItem[]; total: number }> {
  const { q, page = 1, pageSize = 100 } = options;
  const where = {
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" as const } },
            { username: { contains: q, mode: "insensitive" as const } },
            { email: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };
  const currentPage = Math.max(1, page);
  const safePageSize = Math.min(Math.max(1, pageSize), 200);

  const [total, rows] = await db.$transaction([
    db.user.count({ where }),
    db.user.findMany({
      where,
      orderBy: { createdAt: "asc" },
      skip: (currentPage - 1) * safePageSize,
      take: safePageSize,
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        role: true,
        reputation: true,
        rank: { select: { id: true, name: true, color: true } },
        createdAt: true,
      },
    }),
  ]);

  return { items: rows, total };
}

// ============================== ADMIN APPLICATIONS ==============================

export interface AdminApplicationListItem {
  id: string;
  status: string;
  message: string;
  reviewNote: string | null;
  reputationAtSubmit: number;
  createdAt: Date;
  reviewedAt: Date | null;
  user: { id: string; username: string; name: string; reputation: number; role: string };
  reviewer: { name: string } | null;
}

export async function listAdminApplicationsAdmin(
  status?: string,
): Promise<AdminApplicationListItem[]> {
  const where: Prisma.AdminApplicationWhereInput =
    status === "PENDING" || status === "APPROVED" || status === "REJECTED"
      ? { status: status as $Enums.AdminApplicationStatus }
      : {};
  return db.adminApplication.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 200,
    select: {
      id: true,
      status: true,
      message: true,
      reviewNote: true,
      reputationAtSubmit: true,
      createdAt: true,
      reviewedAt: true,
      user: { select: { id: true, username: true, name: true, reputation: true, role: true } },
      reviewer: { select: { name: true } },
    },
  });
}

// ============================== AUDIT ==============================

export interface AdminAuditListItem {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  before: Prisma.JsonValue | null;
  after: Prisma.JsonValue | null;
  createdAt: Date;
  actor: { id: string; username: string; name: string } | null;
}

export interface AdminAuditListResult {
  items: AdminAuditListItem[];
  total: number;
  totalPages: number;
  currentPage: number;
}

export async function listAuditLogsAdmin(
  options: {
    entityType?: string;
    action?: string;
    page?: number;
    pageSize?: number;
  } = {},
): Promise<AdminAuditListResult> {
  const { entityType, action, page = 1, pageSize = 30 } = options;
  const where: Prisma.AuditLogWhereInput = {
    ...(entityType ? { entityType } : {}),
    ...(action ? { action: action as $Enums.AuditAction } : {}),
  };
  const currentPage = Math.max(1, page);
  const safePageSize = Math.min(Math.max(1, pageSize), 100);

  const [total, rows] = await db.$transaction([
    db.auditLog.count({ where }),
    db.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (currentPage - 1) * safePageSize,
      take: safePageSize,
      include: { actor: { select: { id: true, username: true, name: true } } },
    }),
  ]);

  return {
    items: rows,
    total,
    totalPages: Math.max(1, Math.ceil(total / safePageSize)),
    currentPage,
  };
}

// ============================== DASHBOARD ==============================

export async function getDashboardStats() {
  const [
    gameCount,
    publishedGameCount,
    articleCount,
    publishedArticleCount,
    userCount,
    commentCount,
    ratingCount,
    genreCount,
    platformCount,
    favoriteCount,
    reportPendingCount,
    recentAudit,
  ] = await Promise.all([
    db.game.count(),
    db.game.count({ where: { publishStatus: "PUBLISHED" } }),
    db.article.count(),
    db.article.count({ where: { status: "PUBLISHED" } }),
    db.user.count(),
    db.comment.count({ where: { deletedAt: null } }),
    db.gameRating.count(),
    db.genre.count(),
    db.platform.count(),
    db.favorite.count(),
    db.report.count({ where: { status: "PENDING" } }),
    listAuditLogs({ limit: 8 }),
  ]);

  return {
    gameCount,
    publishedGameCount,
    articleCount,
    publishedArticleCount,
    userCount,
    commentCount,
    ratingCount,
    genreCount,
    platformCount,
    favoriteCount,
    reportPendingCount,
    recentAudit,
  };
}
