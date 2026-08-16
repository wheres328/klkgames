"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentUser } from "@/server/auth/getCurrentUser";
import { db } from "@/lib/db";
import { createAuditLog } from "@/server/services/auditService";
import {
  awardReputation,
  MIN_REPUTATION_TO_APPLY,
} from "@/server/services/reputationService";
import { getActorPermissions } from "@/server/services/permissionService";

export type ReputationActionResult = { ok: true } | { ok: false; error: string };

function firstIssue(issues: Array<{ message: string }>): string {
  return issues[0]?.message ?? "Datos inválidos.";
}

function toMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Error inesperado.";
}

const applicationSchema = z.object({
  message: z
    .string()
    .trim()
    .min(20, "Cuéntanos un poco más (mínimo 20 caracteres).")
    .max(2000, "El mensaje es demasiado largo."),
});

// Cualquier miembro con la reputación mínima puede postularse al equipo.
export async function submitAdminApplicationAction(
  message: unknown,
): Promise<ReputationActionResult> {
  const session = await getCurrentUser();
  if (!session) return { ok: false, error: "Debes iniciar sesión para postularte." };
  if (session.role === "ADMIN" || session.role === "MODERATOR") {
    return { ok: false, error: "Ya formas parte del equipo." };
  }

  const parsed = applicationSchema.safeParse(message);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error.issues) };

  try {
    const user = await db.user.findUnique({
      where: { id: session.id },
      select: { username: true, reputation: true, role: true },
    });
    if (!user) return { ok: false, error: "Usuario no encontrado." };

    if (user.reputation < MIN_REPUTATION_TO_APPLY) {
      return {
        ok: false,
        error: `Necesitas al menos ${MIN_REPUTATION_TO_APPLY} puntos de reputación para postularte.`,
      };
    }

    const pending = await db.adminApplication.findFirst({
      where: { userId: session.id, status: "PENDING" },
      select: { id: true },
    });
    if (pending) {
      return { ok: false, error: "Ya tienes una postulación pendiente de revisión." };
    }

    await db.adminApplication.create({
      data: {
        userId: session.id,
        message: parsed.data.message,
        reputationAtSubmit: user.reputation,
      },
    });

    revalidatePath(`/usuarios/${user.username}`);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: toMessage(error) };
  }
}

const reviewSchema = z.object({
  applicationId: z.string().min(1),
  decision: z.enum(["APPROVE", "REJECT"]),
  note: z.string().trim().max(500).optional(),
});

// Solo administradores aprueban/rechazan candidaturas. Aprobar otorga el rol
// de moderador (se audita como GRANT_ROLE).
export async function reviewAdminApplicationAction(input: unknown): Promise<ReputationActionResult> {
  const session = await getCurrentUser();
  if (!session) return { ok: false, error: "Debes iniciar sesión." };
  if (session.role !== "ADMIN") {
    return { ok: false, error: "Solo los administradores pueden revisar postulaciones." };
  }

  const parsed = reviewSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error.issues) };

  try {
    const application = await db.adminApplication.findUnique({
      where: { id: parsed.data.applicationId },
      select: { id: true, userId: true, status: true },
    });
    if (!application) return { ok: false, error: "Postulación no encontrada." };
    if (application.status !== "PENDING") {
      return { ok: false, error: "Esta postulación ya fue revisada." };
    }

    const target = await db.user.findUnique({
      where: { id: application.userId },
      select: { username: true, role: true },
    });
    if (!target) return { ok: false, error: "El usuario ya no existe." };

    await db.$transaction(async (tx) => {
      await tx.adminApplication.update({
        where: { id: application.id },
        data: {
          status: parsed.data.decision === "APPROVE" ? "APPROVED" : "REJECTED",
          reviewNote: parsed.data.note ?? null,
          reviewedBy: session.id,
          reviewedAt: new Date(),
        },
      });

      if (parsed.data.decision === "APPROVE" && target.role !== "ADMIN") {
        await tx.user.update({
          where: { id: application.userId },
          data: { role: "MODERATOR" },
        });
      }
    });

    if (parsed.data.decision === "APPROVE") {
      await createAuditLog({
        actorId: session.id,
        action: "GRANT_ROLE",
        entityType: "User",
        entityId: application.userId,
        after: { role: "MODERATOR", via: "admin-application" },
      });
    }

    revalidatePath("/dashboard/candidaturas");
    revalidatePath(`/usuarios/${target.username}`);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: toMessage(error) };
  }
}

const adjustSchema = z.object({
  userId: z.string().min(1),
  delta: z.number().int("El ajuste debe ser un número entero.").min(-100).max(100).refine((value) => value !== 0, "El ajuste no puede ser 0."),
  note: z.string().trim().max(300).optional(),
});

// El equipo (o un rango con "reputation.award") puede sumar/restar reputación.
export async function adjustReputationAction(input: unknown): Promise<ReputationActionResult> {
  const session = await getCurrentUser();
  if (!session) return { ok: false, error: "Debes iniciar sesión." };

  const permissions = await getActorPermissions(session.id);
  if (!permissions.includes("reputation.award")) {
    return { ok: false, error: "No tienes permisos para realizar esta acción." };
  }

  const parsed = adjustSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error.issues) };

  try {
    const target = await db.user.findUnique({
      where: { id: parsed.data.userId },
      select: { username: true },
    });
    if (!target) return { ok: false, error: "El usuario no existe." };

    await db.$transaction(async (tx) => {
      await awardReputation(tx, {
        userId: parsed.data.userId,
        delta: parsed.data.delta,
        reason: "ADMIN_AWARD",
        note: parsed.data.note,
      });
    });

    await createAuditLog({
      actorId: session.id,
      action: "AWARD_REPUTATION",
      entityType: "User",
      entityId: parsed.data.userId,
      after: { delta: parsed.data.delta, note: parsed.data.note ?? null },
    });

    revalidatePath(`/usuarios/${target.username}`);
    revalidatePath("/dashboard/usuarios");
    return { ok: true };
  } catch (error) {
    return { ok: false, error: toMessage(error) };
  }
}
