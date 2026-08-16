"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/server/auth/getCurrentUser";
import { rateGameSchema, removeRatingSchema } from "@/server/validation/ratingValidation";
import { createRating, deleteRating } from "@/server/services/ratingService";
import { getGameSlugById } from "@/server/services/gameService";

export type RatingActionResult = { ok: true } | { ok: false; error: string };

export async function rateGameAction(input: unknown): Promise<RatingActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Debes iniciar sesión para valorar." };

  const parsed = rateGameSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const { gameId, value } = parsed.data;
  await createRating(user.id, gameId, value);

  const slug = await getGameSlugById(gameId);
  if (slug) revalidatePath(`/games/${slug}`);

  return { ok: true };
}

export async function removeRatingAction(input: unknown): Promise<RatingActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Debes iniciar sesión." };

  const parsed = removeRatingSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const { gameId } = parsed.data;
  await deleteRating(user.id, gameId);

  const slug = await getGameSlugById(gameId);
  if (slug) revalidatePath(`/games/${slug}`);

  return { ok: true };
}
