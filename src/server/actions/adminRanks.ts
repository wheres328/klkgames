"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentUser } from "@/server/auth/getCurrentUser";
import { rankSchema } from "@/server/validation/rankValidation";
import {
  assignRank,
  createRank,
  deleteRank,
  updateRank,
} from "@/server/services/rankService";

export type RankActionResult = { ok: true } | { ok: false; error: string };

function firstIssue(issues: Array<{ message: string }>): string {
  return issues[0]?.message ?? "Datos inválidos.";
}

function toMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Error inesperado.";
}

async function requireAdmin(): Promise<{ ok: true; actorId: string } | { ok: false; error: string }> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Debes iniciar sesión." };
  if (user.role !== "ADMIN") return { ok: false, error: "No tienes permisos para realizar esta acción." };
  return { ok: true, actorId: user.id };
}

const idSchema = z.string().min(1, "ID inválido.");

export async function createRankAction(input: unknown): Promise<RankActionResult> {
  const access = await requireAdmin();
  if (!access.ok) return access;

  const parsed = rankSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error.issues) };

  try {
    await createRank(parsed.data, { actorId: access.actorId });
  } catch (error) {
    return { ok: false, error: toMessage(error) };
  }

  revalidatePath("/dashboard/rangos");
  return { ok: true };
}

export async function updateRankAction(input: unknown): Promise<RankActionResult> {
  const access = await requireAdmin();
  if (!access.ok) return access;

  const schema = rankSchema.extend({ id: idSchema });
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error.issues) };

  try {
    await updateRank(parsed.data.id, parsed.data, { actorId: access.actorId });
  } catch (error) {
    return { ok: false, error: toMessage(error) };
  }

  revalidatePath("/dashboard/rangos");
  revalidatePath("/usuarios");
  return { ok: true };
}

export async function deleteRankAction(id: unknown): Promise<RankActionResult> {
  const access = await requireAdmin();
  if (!access.ok) return access;

  const parsed = idSchema.safeParse(id);
  if (!parsed.success) return { ok: false, error: "ID inválido." };

  try {
    await deleteRank(parsed.data, { actorId: access.actorId });
  } catch (error) {
    return { ok: false, error: toMessage(error) };
  }

  revalidatePath("/dashboard/rangos");
  return { ok: true };
}

export async function assignRankAction(input: unknown): Promise<RankActionResult> {
  const access = await requireAdmin();
  if (!access.ok) return access;

  const parsed = z
    .object({
      userId: idSchema,
      rankId: z.string().trim().max(50).nullable(),
    })
    .safeParse(input);
  if (!parsed.success) return { ok: false, error: "Datos inválidos." };

  try {
    await assignRank(parsed.data.userId, parsed.data.rankId, { actorId: access.actorId });
  } catch (error) {
    return { ok: false, error: toMessage(error) };
  }

  revalidatePath("/dashboard/usuarios");
  return { ok: true };
}
