import { db } from "@/lib/db";
import { toArticleView, type ArticleRow } from "@/server/services/mappers";
import { createArticleSchema, updateArticleSchema } from "@/server/validation/articleValidation";
import { createAuditLog, serializeForAudit } from "@/server/services/auditService";
import type { z } from "zod";
import type { Article } from "@/types/article";

const PUBLISHED = "PUBLISHED";

type CreateArticleInput = z.infer<typeof createArticleSchema>;
type UpdateArticleInput = z.infer<typeof updateArticleSchema>;

export const articleIncludes = {
  author: true,
  tags: true,
  relatedGames: true,
} as const;

export interface ArticleListOptions {
  q?: string;
  status?: string;
  category?: string;
  page?: number;
  pageSize?: number;
}

export interface ArticleListResult {
  items: Article[];
  total: number;
  totalPages: number;
  currentPage: number;
}

export async function getArticleById(id: string): Promise<Article | null> {
  const row = await db.article.findUnique({ where: { id }, include: articleIncludes });
  return row ? toArticleView(row as unknown as ArticleRow) : null;
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const row = await db.article.findFirst({
    where: { slug, status: PUBLISHED },
    include: articleIncludes,
  });
  return row ? toArticleView(row as unknown as ArticleRow) : null;
}

export async function listPublishedArticles(limit?: number): Promise<Article[]> {
  const rows = await db.article.findMany({
    where: { status: PUBLISHED },
    orderBy: [{ publishedAt: "desc" }],
    take: limit,
    include: articleIncludes,
  });
  return (rows as unknown as ArticleRow[]).map(toArticleView);
}

export async function getArticleSlugById(id: string): Promise<string | null> {
  const row = await db.article.findUnique({
    where: { id },
    select: { slug: true },
  });
  return row?.slug ?? null;
}

export async function listPublishedArticleSlugs(): Promise<string[]> {
  const rows = await db.article.findMany({
    where: { status: PUBLISHED },
    select: { slug: true },
  });
  return rows.map((row) => row.slug);
}

// Listado administrativo: respeta Article.status y filtra sin romper privacidad.
export async function listArticles(options: ArticleListOptions = {}): Promise<ArticleListResult> {
  const { q, status, category, page = 1, pageSize = 20 } = options;
  const currentPage = Math.max(1, page);
  const safePageSize = Math.min(Math.max(1, pageSize), 100);

  const where = {
    ...(q
      ? {
          OR: [
            { title: { contains: q, mode: "insensitive" as const } },
            { excerpt: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...(status ? { status: status as "DRAFT" | "PUBLISHED" | "ARCHIVED" } : {}),
    ...(category ? { category } : {}),
  };

  const [total, rows] = await db.$transaction([
    db.article.count({ where }),
    db.article.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      skip: (currentPage - 1) * safePageSize,
      take: safePageSize,
      include: articleIncludes,
    }),
  ]);

  return {
    items: (rows as unknown as ArticleRow[]).map(toArticleView),
    total,
    totalPages: Math.max(1, Math.ceil(total / safePageSize)),
    currentPage,
  };
}

export async function getArticlesByIds(ids: string[]): Promise<Article[]> {
  if (ids.length === 0) return [];
  const rows = await db.article.findMany({
    where: { id: { in: ids }, status: PUBLISHED },
    include: articleIncludes,
  });
  const byId = new Map(rows.map((row) => [row.id, row]));
  return ids.flatMap((id) => {
    const row = byId.get(id);
    return row ? [toArticleView(row as unknown as ArticleRow)] : [];
  });
}

export async function getArticlesForGames(gameSlugs: string[], limit = 4): Promise<Article[]> {
  if (gameSlugs.length === 0) return [];
  const rows = await db.article.findMany({
    where: {
      status: PUBLISHED,
      relatedGames: { some: { slug: { in: gameSlugs } } },
    },
    orderBy: [{ publishedAt: "desc" }],
    take: limit,
    include: articleIncludes,
  });
  return (rows as unknown as ArticleRow[]).map(toArticleView);
}

// Artículos relacionados: misma categoría o etiquetas compartidas, publicados.
export async function getRelatedArticles(id: string, limit = 6): Promise<Article[]> {
  const article = await db.article.findUnique({
    where: { id },
    select: { id: true, category: true, tags: { select: { id: true } } },
  });
  if (!article) return [];
  const tagIds = article.tags.map((tag) => tag.id);

  const rows = await db.article.findMany({
    where: {
      id: { not: id },
      status: PUBLISHED,
      OR: [
        { category: article.category },
        ...(tagIds.length ? [{ tags: { some: { id: { in: tagIds } } } }] : []),
      ],
    },
    orderBy: [{ publishedAt: "desc" }],
    take: limit,
    include: articleIncludes,
  });
  return (rows as unknown as ArticleRow[]).map(toArticleView);
}

// Juegos relacionados al artículo vía la relación many-to-many relatedGames.
export async function getRelatedGames(id: string, limit = 6) {
  const article = await db.article.findUnique({
    where: { id },
    select: { relatedGames: { take: limit, select: { id: true, slug: true, name: true } } },
  });
  return article?.relatedGames ?? [];
}

export async function createArticle(
  input: CreateArticleInput,
  options?: { actorId?: string },
): Promise<Article> {
  const { tagIds, relatedGameIds, content, ...rest } = input;
  const row = await db.$transaction(async (tx) => {
    const created = await tx.article.create({
      data: {
        ...rest,
        content: content as unknown as object,
        ...(tagIds.length ? { tags: { connect: tagIds.map((id) => ({ id })) } } : {}),
        ...(relatedGameIds.length
          ? { relatedGames: { connect: relatedGameIds.map((id) => ({ id })) } }
          : {}),
      },
      include: articleIncludes,
    });
    await createAuditLog(
      {
        actorId: options?.actorId ?? null,
        action: "CREATE_ARTICLE",
        entityType: "Article",
        entityId: created.id,
        after: serializeForAudit(input),
      },
      tx,
    );
    return created;
  });
  return toArticleView(row as unknown as ArticleRow);
}

export async function updateArticle(
  id: string,
  input: UpdateArticleInput,
  options?: { actorId?: string },
): Promise<Article> {
  const row = await db.$transaction(async (tx) => {
    const before = await tx.article.findUnique({ where: { id } });
    const { tagIds, relatedGameIds, content, ...rest } = input;
    const updated = await tx.article.update({
      where: { id },
      data: {
        ...rest,
        ...(content !== undefined ? { content: content as unknown as object } : {}),
        ...(tagIds !== undefined ? { tags: { set: tagIds.map((tagId) => ({ id: tagId })) } } : {}),
        ...(relatedGameIds !== undefined
          ? { relatedGames: { set: relatedGameIds.map((gameId) => ({ id: gameId })) } }
          : {}),
      },
      include: articleIncludes,
    });
    await createAuditLog(
      {
        actorId: options?.actorId ?? null,
        action: "UPDATE_ARTICLE",
        entityType: "Article",
        entityId: id,
        before: before ? serializeForAudit(before) : undefined,
        after: serializeForAudit(input),
      },
      tx,
    );
    return updated;
  });
  return toArticleView(row as unknown as ArticleRow);
}

export async function deleteArticle(id: string, options?: { actorId?: string }): Promise<void> {
  await db.$transaction(async (tx) => {
    const before = await tx.article.findUnique({ where: { id } });
    await tx.article.delete({ where: { id } });
    await createAuditLog(
      {
        actorId: options?.actorId ?? null,
        action: "DELETE_ARTICLE",
        entityType: "Article",
        entityId: id,
        before: before ? serializeForAudit(before) : undefined,
      },
      tx,
    );
  });
}

export async function publishArticle(id: string, options?: { actorId?: string }): Promise<Article> {
  const row = await db.$transaction(async (tx) => {
    const updated = await tx.article.update({
      where: { id },
      data: { status: PUBLISHED, publishedAt: new Date(), archivedAt: null },
      include: articleIncludes,
    });
    await createAuditLog(
      {
        actorId: options?.actorId ?? null,
        action: "PUBLISH_ARTICLE",
        entityType: "Article",
        entityId: id,
        after: serializeForAudit({ status: PUBLISHED }),
      },
      tx,
    );
    return updated;
  });
  return toArticleView(row as unknown as ArticleRow);
}

export async function unpublishArticle(
  id: string,
  options?: { actorId?: string },
): Promise<Article> {
  const row = await db.$transaction(async (tx) => {
    const updated = await tx.article.update({
      where: { id },
      data: { status: "DRAFT" },
      include: articleIncludes,
    });
    await createAuditLog(
      {
        actorId: options?.actorId ?? null,
        action: "UPDATE_ARTICLE",
        entityType: "Article",
        entityId: id,
        after: serializeForAudit({ status: "DRAFT" }),
      },
      tx,
    );
    return updated;
  });
  return toArticleView(row as unknown as ArticleRow);
}

export async function archiveArticle(id: string, options?: { actorId?: string }): Promise<Article> {
  const row = await db.$transaction(async (tx) => {
    const updated = await tx.article.update({
      where: { id },
      data: { status: "ARCHIVED", archivedAt: new Date() },
      include: articleIncludes,
    });
    await createAuditLog(
      {
        actorId: options?.actorId ?? null,
        action: "ARCHIVE_ARTICLE",
        entityType: "Article",
        entityId: id,
        after: serializeForAudit({ status: "ARCHIVED" }),
      },
      tx,
    );
    return updated;
  });
  return toArticleView(row as unknown as ArticleRow);
}
