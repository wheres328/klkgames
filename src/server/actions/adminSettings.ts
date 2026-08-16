"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentUser } from "@/server/auth/getCurrentUser";
import {
  createSocialLink,
  deleteSocialLink,
  updateSiteSettings,
  updateSocialLink,
} from "@/server/services/siteSettingsService";
import {
  createSocialLinkSchema,
  siteSettingsSchema,
  updateSocialLinkSchema,
} from "@/server/validation/siteSettingsValidation";
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

// ============================== AJUSTES DEL SITIO ==============================

export async function adminUpdateSiteSettings(input: unknown): Promise<AdminActionResult> {
  const access = await requireAdmin();
  if ("error" in access) return access;

  const parsed = siteSettingsSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error.issues) };

  try {
    await updateSiteSettings(parsed.data, { actorId: access.user.id });
  } catch (error) {
    return { ok: false, error: toMessage(error) };
  }

  revalidatePath("/", "layout");
  revalidatePath("/dashboard", "layout");
  return { ok: true };
}

// ============================== REDES SOCIALES ==============================

export async function adminCreateSocialLink(input: unknown): Promise<AdminActionResult> {
  const access = await requireAdmin();
  if ("error" in access) return access;

  const parsed = createSocialLinkSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error.issues) };

  try {
    await createSocialLink(parsed.data, { actorId: access.user.id });
  } catch (error) {
    return { ok: false, error: toMessage(error) };
  }

  revalidatePath("/", "layout");
  revalidatePath("/dashboard", "layout");
  return { ok: true };
}

export async function adminUpdateSocialLink(id: unknown, input: unknown): Promise<AdminActionResult> {
  const access = await requireAdmin();
  if ("error" in access) return access;

  const idParsed = z.string().min(1).max(64).safeParse(id);
  if (!idParsed.success) return { ok: false, error: "ID inválido." };

  const parsed = updateSocialLinkSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error.issues) };

  try {
    await updateSocialLink(idParsed.data, parsed.data, { actorId: access.user.id });
  } catch (error) {
    return { ok: false, error: toMessage(error) };
  }

  revalidatePath("/", "layout");
  revalidatePath("/dashboard", "layout");
  return { ok: true };
}

export async function adminDeleteSocialLink(id: unknown): Promise<AdminActionResult> {
  const access = await requireAdmin();
  if ("error" in access) return access;

  const idParsed = z.string().min(1).max(64).safeParse(id);
  if (!idParsed.success) return { ok: false, error: "ID inválido." };

  try {
    await deleteSocialLink(idParsed.data, { actorId: access.user.id });
  } catch (error) {
    return { ok: false, error: toMessage(error) };
  }

  revalidatePath("/", "layout");
  revalidatePath("/dashboard", "layout");
  return { ok: true };
}
