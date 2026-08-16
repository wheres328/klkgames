"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/server/auth/getCurrentUser";
import { updateUser } from "@/server/services/userService";
import { awardBadge, revokeBadge } from "@/server/services/badgeService";
import { awardBadgeSchema, revokeBadgeSchema } from "@/server/validation/badgeValidation";
import { clearedUrlSchema, idSchema } from "@/server/validation/common";
import { getActorPermissions } from "@/server/services/permissionService";
import type { SessionUser } from "@/server/auth/getCurrentUser";
import { z } from "zod";

export type ProfileActionResult = { ok: true } | { ok: false; error: string };

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

// Quien tenga el permiso "badges.award" (admins, moderadores o rangos
// habilitados) puede otorgar/retirar medallas.
async function requireStaff(): Promise<
  { ok: true; user: SessionUser } | { ok: false; error: string }
> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Debes iniciar sesión." };
  const permissions = await getActorPermissions(user.id);
  if (!permissions.includes("badges.award")) {
    return { ok: false, error: "No tienes permisos para realizar esta acción." };
  }
  return { ok: true, user };
}

const updateProfileSchema = z.object({
  name: z.string().trim().min(1, "El nombre no puede estar vacío").max(80),
  bio: z.string().trim().max(500, "La biografía es demasiado larga").optional(),
  image: clearedUrlSchema,
  cover: clearedUrlSchema,
});

// Edición del propio perfil: solo datos personales, nunca rol/email/username.
export async function updateOwnProfile(input: unknown): Promise<ProfileActionResult> {
  const session = await getCurrentUser();
  if (!session) return { ok: false, error: "Debes iniciar sesión para editar tu perfil." };

  const parsed = updateProfileSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error.issues) };

  try {
    await updateUser(
      session.id,
      {
        name: parsed.data.name,
        bio: parsed.data.bio,
        image: parsed.data.image,
        cover: parsed.data.cover,
      },
      { actorId: session.id },
    );
  } catch (error) {
    return { ok: false, error: toMessage(error) };
  }

  revalidatePath("/");
  revalidatePath(`/usuarios/${session.username}`);
  return { ok: true };
}

// Otorgar medalla a un usuario (admin/moderador). El frontend refresca la ruta.
export async function awardBadgeAction(userId: unknown, input: unknown): Promise<ProfileActionResult> {
  const access = await requireStaff();
  if ("error" in access) return access;

  const idParsed = parseId(userId);
  if ("error" in idParsed) return { ok: false, error: idParsed.error };

  const parsed = awardBadgeSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error.issues) };

  try {
    await awardBadge(idParsed.id, parsed.data, { actorId: access.user.id });
  } catch (error) {
    return { ok: false, error: toMessage(error) };
  }

  return { ok: true };
}

// Retirar medalla (admin/moderador).
export async function revokeBadgeAction(
  userId: unknown,
  badgeId: unknown,
): Promise<ProfileActionResult> {
  const access = await requireStaff();
  if ("error" in access) return access;

  const userParsed = parseId(userId);
  if ("error" in userParsed) return { ok: false, error: userParsed.error };

  const parsed = revokeBadgeSchema.safeParse({ badgeId });
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error.issues) };

  try {
    await revokeBadge(userParsed.id, parsed.data.badgeId, { actorId: access.user.id });
  } catch (error) {
    return { ok: false, error: toMessage(error) };
  }

  return { ok: true };
}
