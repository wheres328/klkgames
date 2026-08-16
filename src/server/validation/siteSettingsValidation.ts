import { z } from "zod";
import { clearedUrlSchema, urlSchema } from "./common";

// Conjunto de iconos de redes sociales que el reproductor de iconos (SocialIcon)
// sabe dibujar. Si una red no está en la lista se usa el icono genérico.
export const SOCIAL_ICON_KEYS = [
  "x",
  "discord",
  "youtube",
  "twitch",
  "instagram",
  "facebook",
  "linkedin",
  "tiktok",
  "github",
  "rss",
  "web",
] as const;

export const SOCIAL_ICON_LABELS: Record<string, string> = {
  x: "X (Twitter)",
  discord: "Discord",
  youtube: "YouTube",
  twitch: "Twitch",
  instagram: "Instagram",
  facebook: "Facebook",
  linkedin: "LinkedIn",
  tiktok: "TikTok",
  github: "GitHub",
  rss: "RSS",
  web: "Sitio web",
};

export const socialIconSchema = z.enum(SOCIAL_ICON_KEYS);

const hexColorSchema = z
  .string()
  .trim()
  .regex(/^#([0-9a-fA-F]{6})$/, "Debe ser un color hexadecimal (#rrggbb)");

// Correo opcional que admite cadena vacía (se transforma a null).
const clearedEmailSchema = z
  .union([z.literal(""), z.string().trim().email("Debe ser un correo válido")])
  .nullable()
  .optional()
  .transform((value) => (value === "" ? null : value));

export const siteSettingsSchema = z
  .object({
    name: z.string().trim().min(1, "El nombre no puede estar vacío").max(60, "El nombre es demasiado largo"),
    tagline: z.string().trim().max(40, "La etiqueta es demasiado larga"),
    description: z
      .string()
      .trim()
      .min(1, "La descripción no puede estar vacía")
      .max(400, "La descripción es demasiado larga"),
    url: urlSchema,
    logoUrl: clearedUrlSchema,
    faviconUrl: clearedUrlSchema,
    contactEmail: clearedEmailSchema,
  })
  .partial();

export const createSocialLinkSchema = z.object({
  name: z.string().trim().min(1, "El nombre no puede estar vacío").max(40, "El nombre es demasiado largo"),
  url: urlSchema,
  icon: z.union([socialIconSchema, z.literal("")]).nullable().optional().transform((value) => (value === "" ? null : value)),
  color: z.union([hexColorSchema, z.literal("")]).nullable().optional().transform((value) => (value === "" ? null : value)),
  order: z.coerce.number().int("El orden debe ser un número entero").min(0).max(99).default(0),
  visible: z.coerce.boolean().default(true),
});

export const updateSocialLinkSchema = createSocialLinkSchema.partial();

export const socialLinkIdSchema = z.object({ id: z.string().min(1).max(64) });
