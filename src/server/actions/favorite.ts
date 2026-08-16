"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/server/auth/getCurrentUser";
import { favoriteSchema } from "@/server/validation/favoriteValidation";
import { toggleFavorite } from "@/server/services/favoriteService";
import { getGameSlugById } from "@/server/services/gameService";

export type FavoriteActionResult = { ok: true; favorited: boolean } | { ok: false; error: string };

export async function toggleFavoriteAction(input: unknown): Promise<FavoriteActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Debes iniciar sesión para guardar favoritos." };

  const parsed = favoriteSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const favorited = await toggleFavorite(user.id, parsed.data.gameId);

  const slug = await getGameSlugById(parsed.data.gameId);
  if (slug) revalidatePath(`/games/${slug}`);
  revalidatePath("/favorites");

  return { ok: true, favorited };
}
