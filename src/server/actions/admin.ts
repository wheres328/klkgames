"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/server/auth/getCurrentUser";
import {
  archiveGame,
  createGame,
  deleteGame,
  getGameSlugById,
  publishGame,
  unpublishGame,
  updateGame,
} from "@/server/services/gameService";
import {
  archiveArticle,
  createArticle,
  deleteArticle,
  getArticleSlugById,
  publishArticle,
  unpublishArticle,
  updateArticle,
} from "@/server/services/articleService";
import { createGenre, deleteGenre, updateGenre } from "@/server/services/genreService";
import { createPlatform, deletePlatform, updatePlatform } from "@/server/services/platformService";
import { softDeleteUser, updateUser } from "@/server/services/userService";
import { createBadge, deleteBadge, updateBadge } from "@/server/services/badgeService";
import { createArticleSchema, updateArticleSchema } from "@/server/validation/articleValidation";
import {
  adminCreateGameSchema,
  adminUpdateGameSchema,
} from "@/server/validation/gameValidation";
import { createGenreSchema, updateGenreSchema } from "@/server/validation/genreValidation";
import { createPlatformSchema, updatePlatformSchema } from "@/server/validation/platformValidation";
import { createBadgeSchema, updateBadgeSchema } from "@/server/validation/badgeValidation";
import { idSchema } from "@/server/validation/common";
import { userRoleSchema } from "@/server/validation/userValidation";
import type { SessionUser } from "@/server/auth/getCurrentUser";

export type AdminActionResult = { ok: true } | { ok: false; error: string };

async function requireAdmin(): Promise<
  { ok: true; user: SessionUser } | { ok: false; error: string }
> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Debes iniciar sesión para acceder al panel." };
  if (user.role !== "ADMIN") return { ok: false, error: "No tienes permisos de administrador." };
  return { ok: true, user };
}

function firstIssue(issues: Array<{ message: string }>): string {
  return issues[0]?.message ?? "Datos inválidos.";
}

function toMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Error inesperado.";
}

function parseId(value: unknown): { id: string } | { error: string } {
  const parsed = idSchema.safeParse(value);
  if (!parsed.success) return { error: "ID inválido." };
  return { id: parsed.data };
}

// ============================== GAMES ==============================

export async function adminCreateGame(input: unknown): Promise<AdminActionResult> {
  const access = await requireAdmin();
  if ("error" in access) return access;

  const parsed = adminCreateGameSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error.issues) };

  try {
    await createGame(parsed.data, { actorId: access.user.id });
  } catch (error) {
    return { ok: false, error: toMessage(error) };
  }

  revalidatePath("/");
  revalidatePath("/games");
  revalidatePath("/genres");
  revalidatePath("/dashboard/juegos");
  redirect("/dashboard/juegos");
}

export async function adminUpdateGame(id: unknown, input: unknown): Promise<AdminActionResult> {
  const access = await requireAdmin();
  if ("error" in access) return access;

  const idParsed = parseId(id);
  if ("error" in idParsed) return { ok: false, error: idParsed.error };

  const parsed = adminUpdateGameSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error.issues) };

  try {
    await updateGame(idParsed.id, parsed.data, { actorId: access.user.id });
  } catch (error) {
    return { ok: false, error: toMessage(error) };
  }

  const slug = await getGameSlugById(idParsed.id);
  revalidatePath("/");
  revalidatePath("/games");
  revalidatePath("/genres");
  if (slug) revalidatePath(`/games/${slug}`);
  revalidatePath("/dashboard/juegos");
  redirect("/dashboard/juegos");
}

export async function adminDeleteGame(id: unknown): Promise<AdminActionResult> {
  const access = await requireAdmin();
  if ("error" in access) return access;

  const idParsed = parseId(id);
  if ("error" in idParsed) return { ok: false, error: idParsed.error };

  try {
    await deleteGame(idParsed.id, { actorId: access.user.id });
  } catch (error) {
    return { ok: false, error: toMessage(error) };
  }

  revalidatePath("/");
  revalidatePath("/games");
  revalidatePath("/genres");
  revalidatePath("/dashboard/juegos");
  return { ok: true };
}

export async function adminPublishGame(id: unknown): Promise<AdminActionResult> {
  const access = await requireAdmin();
  if ("error" in access) return access;

  const idParsed = parseId(id);
  if ("error" in idParsed) return { ok: false, error: idParsed.error };

  try {
    await publishGame(idParsed.id, { actorId: access.user.id });
  } catch (error) {
    return { ok: false, error: toMessage(error) };
  }

  const slug = await getGameSlugById(idParsed.id);
  revalidatePath("/");
  revalidatePath("/games");
  revalidatePath("/genres");
  if (slug) revalidatePath(`/games/${slug}`);
  revalidatePath("/dashboard/juegos");
  return { ok: true };
}

export async function adminUnpublishGame(id: unknown): Promise<AdminActionResult> {
  const access = await requireAdmin();
  if ("error" in access) return access;

  const idParsed = parseId(id);
  if ("error" in idParsed) return { ok: false, error: idParsed.error };

  try {
    await unpublishGame(idParsed.id, { actorId: access.user.id });
  } catch (error) {
    return { ok: false, error: toMessage(error) };
  }

  const slug = await getGameSlugById(idParsed.id);
  revalidatePath("/");
  revalidatePath("/games");
  revalidatePath("/genres");
  if (slug) revalidatePath(`/games/${slug}`);
  revalidatePath("/dashboard/juegos");
  return { ok: true };
}

export async function adminArchiveGame(id: unknown): Promise<AdminActionResult> {
  const access = await requireAdmin();
  if ("error" in access) return access;

  const idParsed = parseId(id);
  if ("error" in idParsed) return { ok: false, error: idParsed.error };

  try {
    await archiveGame(idParsed.id, { actorId: access.user.id });
  } catch (error) {
    return { ok: false, error: toMessage(error) };
  }

  const slug = await getGameSlugById(idParsed.id);
  revalidatePath("/");
  revalidatePath("/games");
  revalidatePath("/genres");
  if (slug) revalidatePath(`/games/${slug}`);
  revalidatePath("/dashboard/juegos");
  return { ok: true };
}

// ============================== ARTICLES ==============================

export async function adminCreateArticle(input: unknown): Promise<AdminActionResult> {
  const access = await requireAdmin();
  if ("error" in access) return access;

  const parsed = createArticleSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error.issues) };

  try {
    await createArticle(parsed.data, { actorId: access.user.id });
  } catch (error) {
    return { ok: false, error: toMessage(error) };
  }

  revalidatePath("/");
  revalidatePath("/articles");
  revalidatePath("/dashboard/articulos");
  redirect("/dashboard/articulos");
}

export async function adminUpdateArticle(id: unknown, input: unknown): Promise<AdminActionResult> {
  const access = await requireAdmin();
  if ("error" in access) return access;

  const idParsed = parseId(id);
  if ("error" in idParsed) return { ok: false, error: idParsed.error };

  const parsed = updateArticleSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error.issues) };

  try {
    await updateArticle(idParsed.id, parsed.data, { actorId: access.user.id });
  } catch (error) {
    return { ok: false, error: toMessage(error) };
  }

  const slug = await getArticleSlugById(idParsed.id);
  revalidatePath("/");
  revalidatePath("/articles");
  if (slug) revalidatePath(`/articles/${slug}`);
  revalidatePath("/dashboard/articulos");
  redirect("/dashboard/articulos");
}

export async function adminDeleteArticle(id: unknown): Promise<AdminActionResult> {
  const access = await requireAdmin();
  if ("error" in access) return access;

  const idParsed = parseId(id);
  if ("error" in idParsed) return { ok: false, error: idParsed.error };

  try {
    await deleteArticle(idParsed.id, { actorId: access.user.id });
  } catch (error) {
    return { ok: false, error: toMessage(error) };
  }

  revalidatePath("/");
  revalidatePath("/articles");
  revalidatePath("/dashboard/articulos");
  return { ok: true };
}

export async function adminPublishArticle(id: unknown): Promise<AdminActionResult> {
  const access = await requireAdmin();
  if ("error" in access) return access;

  const idParsed = parseId(id);
  if ("error" in idParsed) return { ok: false, error: idParsed.error };

  try {
    await publishArticle(idParsed.id, { actorId: access.user.id });
  } catch (error) {
    return { ok: false, error: toMessage(error) };
  }

  const slug = await getArticleSlugById(idParsed.id);
  revalidatePath("/");
  revalidatePath("/articles");
  if (slug) revalidatePath(`/articles/${slug}`);
  revalidatePath("/dashboard/articulos");
  return { ok: true };
}

export async function adminUnpublishArticle(id: unknown): Promise<AdminActionResult> {
  const access = await requireAdmin();
  if ("error" in access) return access;

  const idParsed = parseId(id);
  if ("error" in idParsed) return { ok: false, error: idParsed.error };

  try {
    await unpublishArticle(idParsed.id, { actorId: access.user.id });
  } catch (error) {
    return { ok: false, error: toMessage(error) };
  }

  const slug = await getArticleSlugById(idParsed.id);
  revalidatePath("/");
  revalidatePath("/articles");
  if (slug) revalidatePath(`/articles/${slug}`);
  revalidatePath("/dashboard/articulos");
  return { ok: true };
}

export async function adminArchiveArticle(id: unknown): Promise<AdminActionResult> {
  const access = await requireAdmin();
  if ("error" in access) return access;

  const idParsed = parseId(id);
  if ("error" in idParsed) return { ok: false, error: idParsed.error };

  try {
    await archiveArticle(idParsed.id, { actorId: access.user.id });
  } catch (error) {
    return { ok: false, error: toMessage(error) };
  }

  const slug = await getArticleSlugById(idParsed.id);
  revalidatePath("/");
  revalidatePath("/articles");
  if (slug) revalidatePath(`/articles/${slug}`);
  revalidatePath("/dashboard/articulos");
  return { ok: true };
}

// ============================== GENRES ==============================

export async function adminCreateGenre(input: unknown): Promise<AdminActionResult> {
  const access = await requireAdmin();
  if ("error" in access) return access;

  const parsed = createGenreSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error.issues) };

  try {
    await createGenre(parsed.data, { actorId: access.user.id });
  } catch (error) {
    return { ok: false, error: toMessage(error) };
  }

  revalidatePath("/");
  revalidatePath("/genres");
  revalidatePath("/games");
  revalidatePath("/dashboard/generos");
  redirect("/dashboard/generos");
}

export async function adminUpdateGenre(id: unknown, input: unknown): Promise<AdminActionResult> {
  const access = await requireAdmin();
  if ("error" in access) return access;

  const idParsed = parseId(id);
  if ("error" in idParsed) return { ok: false, error: idParsed.error };

  const parsed = updateGenreSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error.issues) };

  try {
    await updateGenre(idParsed.id, parsed.data, { actorId: access.user.id });
  } catch (error) {
    return { ok: false, error: toMessage(error) };
  }

  revalidatePath("/");
  revalidatePath("/genres");
  revalidatePath("/games");
  revalidatePath("/dashboard/generos");
  redirect("/dashboard/generos");
}

export async function adminDeleteGenre(id: unknown): Promise<AdminActionResult> {
  const access = await requireAdmin();
  if ("error" in access) return access;

  const idParsed = parseId(id);
  if ("error" in idParsed) return { ok: false, error: idParsed.error };

  try {
    await deleteGenre(idParsed.id, { actorId: access.user.id });
  } catch (error) {
    return { ok: false, error: toMessage(error) };
  }

  revalidatePath("/");
  revalidatePath("/genres");
  revalidatePath("/games");
  revalidatePath("/dashboard/generos");
  return { ok: true };
}

// ============================== PLATFORMS ==============================

export async function adminCreatePlatform(input: unknown): Promise<AdminActionResult> {
  const access = await requireAdmin();
  if ("error" in access) return access;

  const parsed = createPlatformSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error.issues) };

  try {
    await createPlatform(parsed.data, { actorId: access.user.id });
  } catch (error) {
    return { ok: false, error: toMessage(error) };
  }

  revalidatePath("/games");
  revalidatePath("/dashboard/plataformas");
  redirect("/dashboard/plataformas");
}

export async function adminUpdatePlatform(id: unknown, input: unknown): Promise<AdminActionResult> {
  const access = await requireAdmin();
  if ("error" in access) return access;

  const idParsed = parseId(id);
  if ("error" in idParsed) return { ok: false, error: idParsed.error };

  const parsed = updatePlatformSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error.issues) };

  try {
    await updatePlatform(idParsed.id, parsed.data, { actorId: access.user.id });
  } catch (error) {
    return { ok: false, error: toMessage(error) };
  }

  revalidatePath("/games");
  revalidatePath("/dashboard/plataformas");
  redirect("/dashboard/plataformas");
}

export async function adminDeletePlatform(id: unknown): Promise<AdminActionResult> {
  const access = await requireAdmin();
  if ("error" in access) return access;

  const idParsed = parseId(id);
  if ("error" in idParsed) return { ok: false, error: idParsed.error };

  try {
    await deletePlatform(idParsed.id, { actorId: access.user.id });
  } catch (error) {
    return { ok: false, error: toMessage(error) };
  }

  revalidatePath("/games");
  revalidatePath("/dashboard/plataformas");
  return { ok: true };
}

// ============================== MEDALLAS ==============================

export async function adminCreateBadge(input: unknown): Promise<AdminActionResult> {
  const access = await requireAdmin();
  if ("error" in access) return access;

  const parsed = createBadgeSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error.issues) };

  try {
    await createBadge(parsed.data, { actorId: access.user.id });
  } catch (error) {
    return { ok: false, error: toMessage(error) };
  }

  revalidatePath("/dashboard/medallas");
  redirect("/dashboard/medallas");
}

export async function adminUpdateBadge(id: unknown, input: unknown): Promise<AdminActionResult> {
  const access = await requireAdmin();
  if ("error" in access) return access;

  const idParsed = parseId(id);
  if ("error" in idParsed) return { ok: false, error: idParsed.error };

  const parsed = updateBadgeSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error.issues) };

  try {
    await updateBadge(idParsed.id, parsed.data, { actorId: access.user.id });
  } catch (error) {
    return { ok: false, error: toMessage(error) };
  }

  revalidatePath("/dashboard/medallas");
  redirect("/dashboard/medallas");
}

export async function adminDeleteBadge(id: unknown): Promise<AdminActionResult> {
  const access = await requireAdmin();
  if ("error" in access) return access;

  const idParsed = parseId(id);
  if ("error" in idParsed) return { ok: false, error: idParsed.error };

  try {
    await deleteBadge(idParsed.id, { actorId: access.user.id });
  } catch (error) {
    return { ok: false, error: toMessage(error) };
  }

  revalidatePath("/dashboard/medallas");
  return { ok: true };
}

// ============================== USERS ==============================

export async function adminUpdateUserRole(id: unknown, role: unknown): Promise<AdminActionResult> {
  const access = await requireAdmin();
  if ("error" in access) return access;

  const idParsed = parseId(id);
  if ("error" in idParsed) return { ok: false, error: idParsed.error };

  const parsed = userRoleSchema.safeParse(role);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error.issues) };

  try {
    await updateUser(idParsed.id, { role: parsed.data }, { actorId: access.user.id });
  } catch (error) {
    return { ok: false, error: toMessage(error) };
  }

  revalidatePath("/dashboard/usuarios");
  return { ok: true };
}

export async function adminSoftDeleteUser(id: unknown): Promise<AdminActionResult> {
  const access = await requireAdmin();
  if ("error" in access) return access;

  const idParsed = parseId(id);
  if ("error" in idParsed) return { ok: false, error: idParsed.error };

  if (idParsed.id === access.user.id) {
    return { ok: false, error: "No puedes eliminar tu propia cuenta." };
  }

  try {
    await softDeleteUser(idParsed.id, { actorId: access.user.id });
  } catch (error) {
    return { ok: false, error: toMessage(error) };
  }

  revalidatePath("/dashboard/usuarios");
  return { ok: true };
}
