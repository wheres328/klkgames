import { db } from "@/lib/db";
import { Prisma } from "@/generated/prisma/client";
import { toGenreView, type GenreRow } from "@/server/services/mappers";
import { createGenreSchema, updateGenreSchema } from "@/server/validation/genreValidation";
import { createAuditLog } from "@/server/services/auditService";
import type { z } from "zod";
import type { Genre } from "@/types/genre";

type CreateGenreInput = z.infer<typeof createGenreSchema>;
type UpdateGenreInput = z.infer<typeof updateGenreSchema>;

export async function getGenreById(id: string): Promise<Genre | null> {
  const row = await db.genre.findUnique({ where: { id } });
  return row ? toGenreView(row as unknown as GenreRow) : null;
}

export async function getGenreBySlug(slug: string): Promise<Genre | null> {
  const row = await db.genre.findUnique({ where: { slug } });
  return row ? toGenreView(row as unknown as GenreRow) : null;
}

export async function listGenres(): Promise<Genre[]> {
  const rows = await db.genre.findMany({ orderBy: [{ name: "asc" }] });
  return (rows as unknown as GenreRow[]).map(toGenreView);
}

export async function getGenresByIds(ids: string[]): Promise<Genre[]> {
  if (ids.length === 0) return [];
  const rows = await db.genre.findMany({ where: { id: { in: ids } } });
  const byId = new Map(rows.map((row) => [row.id, row]));
  return ids.flatMap((id) => {
    const row = byId.get(id);
    return row ? [toGenreView(row as unknown as GenreRow)] : [];
  });
}

export async function createGenre(
  input: CreateGenreInput,
  options?: { actorId?: string },
): Promise<Genre> {
  let row: Awaited<ReturnType<typeof db.genre.create>>;
  try {
    row = await db.$transaction(async (tx) => {
      const created = await tx.genre.create({ data: input });
      await createAuditLog(
        {
          actorId: options?.actorId ?? null,
          action: "CREATE_GENRE",
          entityType: "Genre",
          entityId: created.id,
          after: serializeGenreForAudit(input),
        },
        tx,
      );
      return created;
    });
  } catch (error) {
    throw toFriendlyGenreError(error);
  }
  return toGenreView(row as unknown as GenreRow);
}

export async function updateGenre(
  id: string,
  input: UpdateGenreInput,
  options?: { actorId?: string },
): Promise<Genre> {
  let row: Awaited<ReturnType<typeof db.genre.update>>;
  try {
    row = await db.$transaction(async (tx) => {
      const before = await tx.genre.findUnique({ where: { id }, select: genreAuditSelect });
      const updated = await tx.genre.update({ where: { id }, data: input });
      await createAuditLog(
        {
          actorId: options?.actorId ?? null,
          action: "UPDATE_GENRE",
          entityType: "Genre",
          entityId: id,
          before: before ?? undefined,
          after: serializeGenreForAudit(input),
        },
        tx,
      );
      return updated;
    });
  } catch (error) {
    throw toFriendlyGenreError(error);
  }
  return toGenreView(row as unknown as GenreRow);
}

// No borra si el género tiene juegos (la política de borrado del schema exige
// evitar romper relaciones; se cuenta solo el contenido publicado).
export async function deleteGenre(id: string, options?: { actorId?: string }): Promise<void> {
  await db.$transaction(async (tx) => {
    const count = await tx.game.count({ where: { genres: { some: { id } } } });
    if (count > 0) {
      throw new Error(`No se puede borrar el género: tiene ${count} juego(s) asociado(s).`);
    }
    const before = await tx.genre.findUnique({ where: { id }, select: genreAuditSelect });
    await tx.genre.delete({ where: { id } });
    await createAuditLog(
      {
        actorId: options?.actorId ?? null,
        action: "DELETE_GENRE",
        entityType: "Genre",
        entityId: id,
        before: before ?? undefined,
      },
      tx,
    );
  });
}

// Recalcula el contador denormalizado Genre.gameCount a partir de la BD.
// Se llama desde el service layer tras crear/actualizar/borrar/publicar juegos.
// Acepta un cliente de transacción opcional para no anidar $transaction
// cuando se invoca dentro de una transacción interactiva.
export async function recomputeGenreCounts(tx?: Prisma.TransactionClient): Promise<void> {
  const client = tx ?? db;
  const genres = await client.genre.findMany({
    select: {
      id: true,
      _count: {
        select: { games: { where: { publishStatus: "PUBLISHED" } } },
      },
    },
  });

  if (tx) {
    for (const genre of genres) {
      await tx.genre.update({
        where: { id: genre.id },
        data: { gameCount: genre._count.games },
      });
    }
    return;
  }

  await db.$transaction(
    genres.map((genre) =>
      db.genre.update({
        where: { id: genre.id },
        data: { gameCount: genre._count.games },
      }),
    ),
  );
}

const genreAuditSelect = { id: true, slug: true, name: true } as const;

// Traduce el error de unicidad de Prisma (P2002) a un mensaje claro; el resto
// se propaga tal cual para que la capa de acciones lo muestre.
function toFriendlyGenreError(error: unknown): unknown {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
    return new Error("Ya existe un género con ese slug. Prueba con otro slug.");
  }
  return error;
}

function serializeGenreForAudit(input: unknown) {
  const value = input as Partial<CreateGenreInput> | undefined;
  if (!value) return undefined;
  return {
    ...(value.slug ? { slug: value.slug } : {}),
    ...(value.name ? { name: value.name } : {}),
  };
}
