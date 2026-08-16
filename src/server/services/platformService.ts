import { db } from "@/lib/db";
import { toPlatformView, type PlatformRow } from "@/server/services/mappers";
import { createPlatformSchema, updatePlatformSchema } from "@/server/validation/platformValidation";
import { createAuditLog } from "@/server/services/auditService";
import type { z } from "zod";
import type { Platform } from "@/types/platform";

type CreatePlatformInput = z.infer<typeof createPlatformSchema>;
type UpdatePlatformInput = z.infer<typeof updatePlatformSchema>;

export async function getPlatformById(id: string): Promise<Platform | null> {
  const row = await db.platform.findUnique({ where: { id } });
  return row ? toPlatformView(row as unknown as PlatformRow) : null;
}

export async function getPlatformBySlug(slug: string): Promise<Platform | null> {
  const row = await db.platform.findUnique({ where: { slug } });
  return row ? toPlatformView(row as unknown as PlatformRow) : null;
}

export async function listPlatforms(): Promise<Platform[]> {
  const rows = await db.platform.findMany({ orderBy: [{ name: "asc" }] });
  return (rows as unknown as PlatformRow[]).map(toPlatformView);
}

export async function getPlatformsByIds(ids: string[]): Promise<Platform[]> {
  if (ids.length === 0) return [];
  const rows = await db.platform.findMany({ where: { id: { in: ids } } });
  const byId = new Map(rows.map((row) => [row.id, row]));
  return ids.flatMap((id) => {
    const row = byId.get(id);
    return row ? [toPlatformView(row as unknown as PlatformRow)] : [];
  });
}

export async function createPlatform(
  input: CreatePlatformInput,
  options?: { actorId?: string },
): Promise<Platform> {
  const row = await db.$transaction(async (tx) => {
    const created = await tx.platform.create({ data: input });
    await createAuditLog(
      {
        actorId: options?.actorId ?? null,
        action: "CREATE_PLATFORM",
        entityType: "Platform",
        entityId: created.id,
        after: serializePlatformForAudit(input),
      },
      tx,
    );
    return created;
  });
  return toPlatformView(row as unknown as PlatformRow);
}

export async function updatePlatform(
  id: string,
  input: UpdatePlatformInput,
  options?: { actorId?: string },
): Promise<Platform> {
  const row = await db.$transaction(async (tx) => {
    const before = await tx.platform.findUnique({ where: { id }, select: platformAuditSelect });
    const updated = await tx.platform.update({ where: { id }, data: input });
    await createAuditLog(
      {
        actorId: options?.actorId ?? null,
        action: "UPDATE_PLATFORM",
        entityType: "Platform",
        entityId: id,
        before: before ?? undefined,
        after: serializePlatformForAudit(input),
      },
      tx,
    );
    return updated;
  });
  return toPlatformView(row as unknown as PlatformRow);
}

// No borra si hay juegos o descargas que la referencian (evita romper relaciones).
export async function deletePlatform(id: string, options?: { actorId?: string }): Promise<void> {
  await db.$transaction(async (tx) => {
    const [games, downloads] = await Promise.all([
      tx.game.count({ where: { platforms: { some: { id } } } }),
      tx.download.count({ where: { platformId: id } }),
    ]);
    if (games + downloads > 0) {
      throw new Error(
        `No se puede borrar la plataforma: está en uso por ${games} juego(s) y ${downloads} descarga(s).`,
      );
    }
    const before = await tx.platform.findUnique({ where: { id }, select: platformAuditSelect });
    await tx.platform.delete({ where: { id } });
    await createAuditLog(
      {
        actorId: options?.actorId ?? null,
        action: "DELETE_PLATFORM",
        entityType: "Platform",
        entityId: id,
        before: before ?? undefined,
      },
      tx,
    );
  });
}

const platformAuditSelect = { id: true, slug: true, name: true, shortName: true } as const;

function serializePlatformForAudit(input: unknown) {
  const value = input as Partial<CreatePlatformInput> | undefined;
  if (!value) return undefined;
  return {
    ...(value.slug ? { slug: value.slug } : {}),
    ...(value.name ? { name: value.name } : {}),
    ...(value.shortName ? { shortName: value.shortName } : {}),
  };
}
