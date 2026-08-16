"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentUser } from "@/server/auth/getCurrentUser";
import { donationSchema } from "@/server/validation/donationValidation";
import { createDonation, updateDonation, deleteDonation } from "@/server/services/donationService";

export type DonationActionResult = { ok: true } | { ok: false; error: string };

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

export async function createDonationAction(input: unknown): Promise<DonationActionResult> {
  const access = await requireAdmin();
  if (!access.ok) return access;

  const parsed = donationSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error.issues) };

  try {
    await createDonation(parsed.data, { actorId: access.actorId });
  } catch (error) {
    return { ok: false, error: toMessage(error) };
  }

  revalidatePath("/dashboard/donaciones");
  revalidatePath("/donar");
  return { ok: true };
}

export async function updateDonationAction(input: unknown): Promise<DonationActionResult> {
  const access = await requireAdmin();
  if (!access.ok) return access;

  const schema = donationSchema.extend({ id: idSchema });
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error.issues) };

  try {
    await updateDonation(parsed.data.id, parsed.data, { actorId: access.actorId });
  } catch (error) {
    return { ok: false, error: toMessage(error) };
  }

  revalidatePath("/dashboard/donaciones");
  revalidatePath("/donar");
  return { ok: true };
}

export async function deleteDonationAction(id: unknown): Promise<DonationActionResult> {
  const access = await requireAdmin();
  if (!access.ok) return access;

  const parsed = idSchema.safeParse(id);
  if (!parsed.success) return { ok: false, error: "ID inválido." };

  try {
    await deleteDonation(parsed.data, { actorId: access.actorId });
  } catch (error) {
    return { ok: false, error: toMessage(error) };
  }

  revalidatePath("/dashboard/donaciones");
  revalidatePath("/donar");
  return { ok: true };
}
