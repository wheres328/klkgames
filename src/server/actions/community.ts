"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/server/auth/getCurrentUser";
import {
  createCommentSchema,
  deleteCommentSchema,
  likeCommentSchema,
  reportCommentSchema,
  updateCommentSchema,
} from "@/server/validation/commentValidation";
import {
  createComment as createCommentService,
  deleteComment as deleteCommentService,
  getCommentParent,
  reportComment as reportCommentService,
  toggleCommentLike as toggleCommentLikeService,
  updateComment as updateCommentService,
} from "@/server/services/commentService";
import { getGameSlugById } from "@/server/services/gameService";
import { getArticleSlugById } from "@/server/services/articleService";

export type CommentActionResult = { ok: true } | { ok: false; error: string };
export type CommentLikeActionResult = { ok: true; liked: boolean } | { ok: false; error: string };

export async function createComment(input: unknown): Promise<CommentActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Debes iniciar sesión para comentar." };

  const parsed = createCommentSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const { gameId, articleId, parentId, content } = parsed.data;

  try {
    await createCommentService({
      gameId,
      articleId,
      parentId,
      authorId: user.id,
      content,
    });
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "No se pudo publicar el comentario.",
    };
  }

  if (gameId) {
    const slug = await getGameSlugById(gameId);
    if (slug) revalidatePath(`/games/${slug}`);
  }
  if (articleId) {
    const slug = await getArticleSlugById(articleId);
    if (slug) revalidatePath(`/articles/${slug}`);
  }

  return { ok: true };
}

export async function updateComment(input: unknown): Promise<CommentActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Debes iniciar sesión." };

  const parsed = updateCommentSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  try {
    await updateCommentService({
      commentId: parsed.data.commentId,
      authorId: user.id,
      content: parsed.data.content,
    });
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "No se pudo editar el comentario.",
    };
  }

  const parent = await getCommentParent(parsed.data.commentId);
  if (parent?.gameId) {
    const slug = await getGameSlugById(parent.gameId);
    if (slug) revalidatePath(`/games/${slug}`);
  } else if (parent?.articleId) {
    const slug = await getArticleSlugById(parent.articleId);
    if (slug) revalidatePath(`/articles/${slug}`);
  }

  return { ok: true };
}

export async function deleteComment(input: unknown): Promise<CommentActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Debes iniciar sesión." };

  const parsed = deleteCommentSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  try {
    await deleteCommentService({
      commentId: parsed.data.commentId,
      authorId: user.id,
    });
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "No se pudo eliminar el comentario.",
    };
  }

  const parent = await getCommentParent(parsed.data.commentId);
  if (parent?.gameId) {
    const slug = await getGameSlugById(parent.gameId);
    if (slug) revalidatePath(`/games/${slug}`);
  } else if (parent?.articleId) {
    const slug = await getArticleSlugById(parent.articleId);
    if (slug) revalidatePath(`/articles/${slug}`);
  }

  return { ok: true };
}

export async function toggleCommentLike(input: unknown): Promise<CommentLikeActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Debes iniciar sesión para dar me gusta." };

  const parsed = likeCommentSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  try {
    const liked = await toggleCommentLikeService(parsed.data.commentId, user.id);
    const parent = await getCommentParent(parsed.data.commentId);
    if (parent?.gameId) {
      const slug = await getGameSlugById(parent.gameId);
      if (slug) revalidatePath(`/games/${slug}`);
    } else if (parent?.articleId) {
      const slug = await getArticleSlugById(parent.articleId);
      if (slug) revalidatePath(`/articles/${slug}`);
    }
    return { ok: true, liked };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "No se pudo actualizar el me gusta.",
    };
  }
}

export async function reportComment(input: unknown): Promise<CommentActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Debes iniciar sesión para reportar." };

  const parsed = reportCommentSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  try {
    await reportCommentService({
      commentId: parsed.data.commentId,
      reporterId: user.id,
      reason: parsed.data.reason,
    });
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "No se pudo enviar el aviso.",
    };
  }

  return { ok: true };
}
