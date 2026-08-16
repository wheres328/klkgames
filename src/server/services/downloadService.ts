import { db } from "@/lib/db";
import { createDownloadSchema, updateDownloadSchema } from "@/server/validation/downloadValidation";
import type { z } from "zod";

type CreateDownloadInput = z.infer<typeof createDownloadSchema>;
type UpdateDownloadInput = z.infer<typeof updateDownloadSchema>;

export interface GameDownloadView {
  id: string;
  store: string;
  type: string;
  name: string;
  url: string;
  platformId: string | null;
  platformName: string | null;
  version: string | null;
  size: string | null;
  isOfficial: boolean;
  order: number;
}

interface DownloadRow {
  id: string;
  store: string;
  type: string;
  name: string;
  url: string;
  platformId: string | null;
  version: string | null;
  size: string | null;
  isOfficial: boolean;
  order: number;
  platform: { shortName: string; name: string } | null;
}

// Los downloads son enlaces/metadatos: NO almacenamiento físico de juegos.
export async function createDownload(input: CreateDownloadInput) {
  const { platformId, ...rest } = input;
  return db.download.create({
    data: {
      ...rest,
      ...(platformId ? { platformId } : { platformId: null }),
    },
  });
}

export async function getDownloadsForGame(gameId: string): Promise<GameDownloadView[]> {
  const rows = await db.download.findMany({
    where: { gameId },
    orderBy: [{ order: "asc" as const }, { createdAt: "asc" as const }],
    include: { platform: { select: { shortName: true, name: true } } },
  });
  return (rows as unknown as DownloadRow[]).map((row) => ({
    id: row.id,
    store: row.store,
    type: row.type,
    name: row.name,
    url: row.url,
    platformId: row.platformId,
    platformName: row.platform?.shortName ?? row.platform?.name ?? null,
    version: row.version,
    size: row.size,
    isOfficial: row.isOfficial,
    order: row.order,
  }));
}

export async function updateDownload(id: string, input: UpdateDownloadInput): Promise<void> {
  const { platformId, ...rest } = input;
  await db.download.update({
    where: { id },
    data: {
      ...rest,
      ...(platformId !== undefined ? { platformId: platformId ?? null } : {}),
    },
  });
}

export async function deleteDownload(id: string): Promise<void> {
  await db.download.delete({ where: { id } });
}
