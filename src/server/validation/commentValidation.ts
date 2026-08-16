import { z } from "zod";
import { contentSchema, idSchema } from "./common";

export const commentIdSchema = z.object({ commentId: idSchema });

export const createCommentSchema = z
  .object({
    gameId: idSchema.optional(),
    articleId: idSchema.optional(),
    parentId: idSchema.optional(),
    content: contentSchema,
  })
  .refine((value) => Boolean(value.gameId) !== Boolean(value.articleId), {
    message: "El comentario debe pertenecer a un juego o a un artículo, no a ambos.",
  });

export const updateCommentSchema = z.object({
  commentId: idSchema,
  content: contentSchema,
});

export const deleteCommentSchema = z.object({
  commentId: idSchema,
});

export const likeCommentSchema = z.object({
  commentId: idSchema,
});

export const reportCommentSchema = z.object({
  commentId: idSchema,
  reason: z
    .string()
    .trim()
    .min(3, "El motivo debe tener al menos 3 caracteres.")
    .max(280, "El motivo no puede superar los 280 caracteres."),
});
