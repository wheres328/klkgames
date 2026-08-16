import { db } from "@/lib/db";
import { toCommentView, type CommentRow } from "@/server/services/mappers";
import type { Comment } from "@/types/comment";
import { awardReputation, revokeReputation, REPUTATION_POINTS } from "@/server/services/reputationService";

const commentIncludes = {
  author: true,
  gameRating: true,
} as const;

function buildCommentTree(rows: CommentRow[]): CommentRow[] {
  const byParent = new Map<string | null, CommentRow[]>();
  for (const row of rows) {
    const key = row.parentId ?? null;
    const bucket = byParent.get(key) ?? [];
    bucket.push(row);
    byParent.set(key, bucket);
  }

  const build = (parentId: string | null): CommentRow[] =>
    (byParent.get(parentId) ?? []).map((row) => ({
      ...row,
      replies: build(row.id),
    }));

  return build(null);
}

export interface CreateCommentInput {
  gameId?: string;
  articleId?: string;
  parentId?: string;
  authorId: string;
  content: string;
}

// Invariante "exactamente uno" game/article: lo garantiza la validación Zod y se
// refuerza aquí como regla de negocio (Prisma no tiene CHECK constraint).
export async function createComment(input: CreateCommentInput) {
  if (Boolean(input.gameId) === Boolean(input.articleId)) {
    throw new Error("El comentario debe pertenecer a un juego o a un artículo, no a ambos.");
  }

  if (input.parentId) {
    const parent = await db.comment.findUnique({
      where: { id: input.parentId },
      select: { gameId: true, articleId: true },
    });
    if (!parent) throw new Error("El comentario al que respondes no existe.");
    if (
      parent.gameId !== (input.gameId ?? null) ||
      parent.articleId !== (input.articleId ?? null)
    ) {
      throw new Error("No puedes responder a un comentario de otro hilo.");
    }
  }

  return db.$transaction(async (tx) => {
    const created = await tx.comment.create({
      data: {
        gameId: input.gameId,
        articleId: input.articleId,
        parentId: input.parentId,
        authorId: input.authorId,
        content: input.content,
      },
    });
    await awardReputation(tx, {
      userId: input.authorId,
      delta: REPUTATION_POINTS.COMMENT_CREATED,
      reason: "COMMENT_CREATED",
      referenceId: created.id,
    });
    return created;
  });
}

export interface UpdateCommentInput {
  commentId: string;
  authorId: string;
  content: string;
}

export async function updateComment(input: UpdateCommentInput): Promise<void> {
  const result = await db.comment.updateMany({
    where: { id: input.commentId, authorId: input.authorId, deletedAt: null },
    data: { content: input.content, edited: true },
  });
  if (result.count === 0) {
    throw new Error("Comentario no encontrado o no tienes permiso para editarlo.");
  }
}

export interface DeleteCommentInput {
  commentId: string;
  authorId: string;
}

// Soft-delete (deletedAt) para preservar la discusión.
export async function deleteComment(input: DeleteCommentInput): Promise<void> {
  await db.$transaction(async (tx) => {
    const result = await tx.comment.updateMany({
      where: { id: input.commentId, authorId: input.authorId, deletedAt: null },
      data: { deletedAt: new Date() },
    });
    if (result.count === 0) {
      throw new Error("Comentario no encontrado o no tienes permiso para eliminarlo.");
    }
    await revokeReputation(tx, {
      userId: input.authorId,
      reason: "COMMENT_CREATED",
      referenceId: input.commentId,
    });
  });
}

export async function getCommentById(id: string): Promise<Comment | null> {
  const row = await db.comment.findFirst({
    where: { id, deletedAt: null },
    include: commentIncludes,
  });
  return row ? toCommentView(row as unknown as CommentRow) : null;
}

export interface CommentListOptions {
  gameId?: string;
  articleId?: string;
  limit?: number;
  offset?: number;
  viewerId?: string;
}

// Anota cada comentario con si el visitante actual le ha dado "me gusta",
// para poder resaltar el pulgar sin una consulta por comentario (evita N+1).
async function annotateLikes(rows: CommentRow[], viewerId?: string): Promise<CommentRow[]> {
  if (!viewerId || rows.length === 0) return rows;
  const likes = await db.commentLike.findMany({
    where: { userId: viewerId, commentId: { in: rows.map((row) => row.id) } },
    select: { commentId: true },
  });
  const liked = new Set(likes.map((like) => like.commentId));
  return rows.map((row) => ({ ...row, likedByViewer: liked.has(row.id) }));
}

export async function listComments(options: CommentListOptions = {}): Promise<Comment[]> {
  const { gameId, articleId, limit = 100, offset = 0, viewerId } = options;
  const rows = await db.comment.findMany({
    where: {
      ...(gameId ? { gameId } : {}),
      ...(articleId ? { articleId } : {}),
      deletedAt: null,
    },
    orderBy: { createdAt: "asc" },
    skip: Math.max(0, offset),
    take: Math.min(Math.max(1, limit), 500),
    include: commentIncludes,
  });
  const annotated = await annotateLikes(rows as unknown as CommentRow[], viewerId);
  return buildCommentTree(annotated).map(toCommentView);
}

export async function getCommentsForGame(gameId: string, viewerId?: string): Promise<Comment[]> {
  return listComments({ gameId, viewerId });
}

export async function getCommentsForArticle(articleId: string, viewerId?: string): Promise<Comment[]> {
  return listComments({ articleId, viewerId });
}

export async function likeComment(commentId: string, userId: string): Promise<void> {
  await db.$transaction(async (tx) => {
    await tx.commentLike.upsert({
      where: { commentId_userId: { commentId, userId } },
      update: {},
      create: { commentId, userId },
    });
    await tx.comment.update({ where: { id: commentId }, data: { likes: { increment: 1 } } });

    const comment = await tx.comment.findUnique({
      where: { id: commentId },
      select: { authorId: true },
    });
    if (comment && comment.authorId !== userId) {
      await awardReputation(tx, {
        userId: comment.authorId,
        delta: REPUTATION_POINTS.COMMENT_LIKE_RECEIVED,
        reason: "COMMENT_LIKE_RECEIVED",
        referenceId: `${commentId}:${userId}`,
      });
    }
  });
}

export async function unlikeComment(commentId: string, userId: string): Promise<void> {
  await db.$transaction(async (tx) => {
    const deleted = await tx.commentLike.deleteMany({ where: { commentId, userId } });
    if (deleted.count > 0) {
      await tx.comment.update({ where: { id: commentId }, data: { likes: { decrement: 1 } } });

      const comment = await tx.comment.findUnique({
        where: { id: commentId },
        select: { authorId: true },
      });
      if (comment && comment.authorId !== userId) {
        await revokeReputation(tx, {
          userId: comment.authorId,
          reason: "COMMENT_LIKE_RECEIVED",
          referenceId: `${commentId}:${userId}`,
        });
      }
    }
  });
}

export async function toggleCommentLike(commentId: string, userId: string): Promise<boolean> {
  const existing = await db.commentLike.findUnique({
    where: { commentId_userId: { commentId, userId } },
    select: { id: true },
  });
  if (existing) {
    await unlikeComment(commentId, userId);
    return false;
  }
  await likeComment(commentId, userId);
  return true;
}

export async function getCommentParent(
  commentId: string,
): Promise<{ gameId: string | null; articleId: string | null } | null> {
  const row = await db.comment.findUnique({
    where: { id: commentId },
    select: { gameId: true, articleId: true },
  });
  return row;
}

export interface ReportCommentInput {
  commentId: string;
  reporterId: string;
  reason: string;
}

export async function reportComment(input: ReportCommentInput): Promise<void> {
  const target = await db.comment.findUnique({
    where: { id: input.commentId },
    select: { id: true },
  });
  if (!target) throw new Error("El comentario que quieres reportar no existe.");

  await db.report.upsert({
    where: {
      reporterId_targetType_targetId: {
        reporterId: input.reporterId,
        targetType: "COMMENT",
        targetId: input.commentId,
      },
    },
    update: {},
    create: {
      reporterId: input.reporterId,
      targetType: "COMMENT",
      targetId: input.commentId,
      reason: input.reason,
    },
  });
}
