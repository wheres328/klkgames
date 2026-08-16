import { cache } from "react";
import { db } from "@/lib/db";
import { siteConfig } from "@/config/site";
import {
  createSocialLinkSchema,
  siteSettingsSchema,
  updateSocialLinkSchema,
} from "@/server/validation/siteSettingsValidation";
import { createAuditLog } from "@/server/services/auditService";
import type { z } from "zod";

export type SiteSettings = {
  name: string;
  tagline: string;
  description: string;
  url: string;
  logoUrl: string | null;
  faviconUrl: string | null;
  contactEmail: string | null;
};

export interface SocialLinkView {
  id: string;
  name: string;
  url: string;
  icon: string | null;
  color: string | null;
  order: number;
  visible: boolean;
}

type CreateSocialLinkInput = z.infer<typeof createSocialLinkSchema>;
type UpdateSocialLinkInput = z.infer<typeof updateSocialLinkSchema>;

function toStringValue(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

// Lee los ajustes del sitio mezclando los valores por defecto de siteConfig con
// las filas guardadas en SiteSetting. `cache()` evita consultas repetidas dentro
// de la misma petición; al guardar se invalida con revalidatePath("/", "layout").
export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  let rows: { key: string; value: unknown }[] = [];
  try {
    rows = await db.siteSetting.findMany({ select: { key: true, value: true } });
  } catch {
    // Si la base de datos no responde, se usan los valores por defecto.
  }

  const stored = new Map(rows.map((row) => [row.key, row.value]));
  const get = (key: string) => toStringValue(stored.get(key));

  return {
    name: get("name") ?? siteConfig.name,
    tagline: get("tagline") ?? siteConfig.tagline,
    description: get("description") ?? siteConfig.description,
    url: get("url") ?? siteConfig.url,
    logoUrl: get("logoUrl"),
    faviconUrl: get("faviconUrl"),
    contactEmail: get("contactEmail"),
  };
});

// Guarda (upsert) los ajustes recibidos. `input` ya viene validado por el
// schema correspondiente; los campos ausentes se dejan como estaban.
export async function updateSiteSettings(
  input: z.infer<typeof siteSettingsSchema>,
  options?: { actorId?: string },
): Promise<void> {
  const entries = Object.entries(input).filter(([, value]) => value !== undefined) as [
    string,
    string | null,
  ][];

  await db.$transaction(async (tx) => {
    for (const [key, value] of entries) {
      await tx.siteSetting.upsert({
        where: { key },
        create: { key, value: value ?? "" },
        update: { value: value ?? "" },
      });
    }
    await createAuditLog(
      {
        actorId: options?.actorId ?? null,
        action: "UPDATE_SETTING",
        entityType: "SiteSetting",
        entityId: "site",
        after: { keys: entries.map(([key]) => key) },
      },
      tx,
    );
  });
}

export async function listSocialLinks(): Promise<SocialLinkView[]> {
  const rows = await db.socialLink.findMany({ orderBy: [{ order: "asc" }, { name: "asc" }] });
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    url: row.url,
    icon: row.icon,
    color: row.color,
    order: row.order,
    visible: row.visible,
  }));
}

export async function listVisibleSocialLinks(): Promise<SocialLinkView[]> {
  const rows = await db.socialLink.findMany({
    where: { visible: true },
    orderBy: [{ order: "asc" }, { name: "asc" }],
  });
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    url: row.url,
    icon: row.icon,
    color: row.color,
    order: row.order,
    visible: row.visible,
  }));
}

export async function createSocialLink(
  input: CreateSocialLinkInput,
  options?: { actorId?: string },
): Promise<SocialLinkView> {
  const created = await db.socialLink.create({ data: input });
  await createAuditLog({
    actorId: options?.actorId ?? null,
    action: "UPDATE_SETTING",
    entityType: "SocialLink",
    entityId: created.id,
    after: { name: created.name, url: created.url },
  });
  return toSocialLinkView(created);
}

export async function updateSocialLink(
  id: string,
  input: UpdateSocialLinkInput,
  options?: { actorId?: string },
): Promise<SocialLinkView> {
  const updated = await db.socialLink.update({ where: { id }, data: input });
  await createAuditLog({
    actorId: options?.actorId ?? null,
    action: "UPDATE_SETTING",
    entityType: "SocialLink",
    entityId: id,
    after: { name: updated.name, url: updated.url },
  });
  return toSocialLinkView(updated);
}

export async function deleteSocialLink(
  id: string,
  options?: { actorId?: string },
): Promise<void> {
  const before = await db.socialLink.findUnique({ where: { id } });
  await db.socialLink.delete({ where: { id } });
  await createAuditLog({
    actorId: options?.actorId ?? null,
    action: "UPDATE_SETTING",
    entityType: "SocialLink",
    entityId: id,
    before: before
      ? { name: before.name, url: before.url }
      : undefined,
  });
}

function toSocialLinkView(
  row: { id: string; name: string; url: string; icon: string | null; color: string | null; order: number; visible: boolean },
): SocialLinkView {
  return {
    id: row.id,
    name: row.name,
    url: row.url,
    icon: row.icon,
    color: row.color,
    order: row.order,
    visible: row.visible,
  };
}
