import { z } from "zod";
import { idSchema, slugSchema, urlSchema } from "./common";

export const gameIdSchema = z.object({ id: idSchema });
export const gameSlugSchema = z.object({ slug: slugSchema });

export const gameStatusSchema = z.enum([
  "RELEASED",
  "EARLY_ACCESS",
  "UPCOMING",
  "ABANDONED",
  "DEMO",
]);
export const gamePublishStatusSchema = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);
export const pricingModelSchema = z.enum(["FREE", "PAID", "FREE_TO_PLAY", "DEMO"]);
export const recommendationTierSchema = z.enum([
  "EXCELENTE",
  "BUENO",
  "ACEPTABLE",
  "NO_RECOMENDADO",
]);

const imageKindSchema = z.enum(["COVER", "BANNER", "SCREENSHOT", "GALLERY"]);

// Cadena opcional que se convierte en null cuando llega vacía (para limpiar campos).
const clearedStringSchema = z
  .union([z.literal(""), z.string().trim().min(1).max(80)])
  .nullable()
  .transform((value) => (value === "" ? null : value));

export const createGameSchema = z.object({
  slug: slugSchema,
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().min(1).max(500),
  longDescription: z.string().trim().min(1).max(20000),
  developer: z.string().trim().min(1).max(120),
  publisher: z.string().trim().min(1).max(120),
  releaseDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "La fecha debe tener el formato YYYY-MM-DD"),
  status: gameStatusSchema.default("RELEASED"),
  publishStatus: gamePublishStatusSchema.default("DRAFT"),
  pricingModel: pricingModelSchema.default("PAID"),
  isSingleplayer: z.boolean().default(true),
  isMultiplayer: z.boolean().default(false),
  isIndie: z.boolean().default(false),
  recommendedTier: recommendationTierSchema.default("ACEPTABLE"),
  features: z.array(z.string().trim().min(1).max(80)).max(50).default([]),
  seoTitle: z.string().trim().max(160).optional(),
  seoDescription: z.string().trim().max(320).optional(),
  ogImage: urlSchema.optional(),
  keywords: z.array(z.string().trim().max(40)).max(50).default([]),
  zipPassword: clearedStringSchema.optional(),
  genreIds: z.array(idSchema).max(30).default([]),
  platformIds: z.array(idSchema).max(20).default([]),
  tagIds: z.array(idSchema).max(30).default([]),
});

export const updateGameSchema = z.object({
  slug: slugSchema.optional(),
  name: z.string().trim().min(1).max(120).optional(),
  description: z.string().trim().min(1).max(500).optional(),
  longDescription: z.string().trim().min(1).max(20000).optional(),
  developer: z.string().trim().min(1).max(120).optional(),
  publisher: z.string().trim().min(1).max(120).optional(),
  releaseDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "La fecha debe tener el formato YYYY-MM-DD")
    .optional(),
  status: gameStatusSchema.optional(),
  publishStatus: gamePublishStatusSchema.optional(),
  pricingModel: pricingModelSchema.optional(),
  isSingleplayer: z.boolean().optional(),
  isMultiplayer: z.boolean().optional(),
  isIndie: z.boolean().optional(),
  recommendedTier: recommendationTierSchema.optional(),
  features: z.array(z.string().trim().min(1).max(80)).max(50).optional(),
  seoTitle: z.string().trim().max(160).optional(),
  seoDescription: z.string().trim().max(320).optional(),
  ogImage: urlSchema.optional(),
  keywords: z.array(z.string().trim().max(40)).max(50).optional(),
  zipPassword: clearedStringSchema.optional(),
  genreIds: z.array(idSchema).max(30).optional(),
  platformIds: z.array(idSchema).max(20).optional(),
  tagIds: z.array(idSchema).max(30).optional(),
});

// ===== Esquemas del panel administrativo (ficha simplificada) =====
// La ficha del admin cubre lo esencial: datos, descripción, fotos,
// especificaciones, enlaces de descarga y un vídeo.

export const downloadStoreSchema = z.enum([
  "STEAM",
  "GOG",
  "EPIC",
  "MICROSOFT",
  "PLAYSTATION",
  "XBOX",
  "NINTENDO",
  "OFFICIAL",
  "OTHER",
]);

const requirementSetSchema = z.object({
  os: z.string().trim().max(120).default(""),
  cpu: z.string().trim().max(120).default(""),
  gpu: z.string().trim().max(120).default(""),
  ram: z.string().trim().max(120).default(""),
  vram: z.string().trim().max(120).default(""),
  storage: z.string().trim().max(120).default(""),
  directx: z.string().trim().max(120).default(""),
});

export const adminGameDownloadSchema = z.object({
  store: downloadStoreSchema,
  name: z.string().trim().min(1).max(120),
  url: urlSchema,
});

export const adminGameResourcesSchema = z.object({
  coverUrl: urlSchema,
  screenshots: z.array(urlSchema).max(30).default([]),
  videoUrl: z.union([z.literal(""), urlSchema]).optional(),
  downloads: z.array(adminGameDownloadSchema).max(20).default([]),
  requirements: z
    .object({
      minimum: requirementSetSchema.optional(),
      recommended: requirementSetSchema.optional(),
    })
    .optional(),
});

export const adminCreateGameSchema = createGameSchema.merge(adminGameResourcesSchema);
export const adminUpdateGameSchema = z.object({
  slug: slugSchema.optional(),
  name: z.string().trim().min(1).max(120).optional(),
  description: z.string().trim().min(1).max(500).optional(),
  longDescription: z.string().trim().min(1).max(20000).optional(),
  developer: z.string().trim().min(1).max(120).optional(),
  publisher: z.string().trim().min(1).max(120).optional(),
  releaseDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "La fecha debe tener el formato YYYY-MM-DD")
    .optional(),
  status: gameStatusSchema.optional(),
  publishStatus: gamePublishStatusSchema.optional(),
  pricingModel: pricingModelSchema.optional(),
  isSingleplayer: z.boolean().optional(),
  isMultiplayer: z.boolean().optional(),
  isIndie: z.boolean().optional(),
  recommendedTier: recommendationTierSchema.optional(),
  features: z.array(z.string().trim().min(1).max(80)).max(50).optional(),
  seoTitle: z.string().trim().max(160).optional(),
  seoDescription: z.string().trim().max(320).optional(),
  ogImage: urlSchema.optional(),
  keywords: z.array(z.string().trim().max(40)).max(50).optional(),
  zipPassword: clearedStringSchema.optional(),
  genreIds: z.array(idSchema).max(30).optional(),
  platformIds: z.array(idSchema).max(20).optional(),
  tagIds: z.array(idSchema).max(30).optional(),
  coverUrl: urlSchema.optional(),
  screenshots: z.array(urlSchema).max(30).optional(),
  videoUrl: z.union([z.literal(""), urlSchema]).optional(),
  downloads: z.array(adminGameDownloadSchema).max(20).optional(),
  requirements: z
    .object({
      minimum: requirementSetSchema.optional(),
      recommended: requirementSetSchema.optional(),
    })
    .optional(),
});

// Imagen de juego ligada a un juego (create/update nested en el propio juego o standalone).
export const createGameImageSchema = z.object({
  gameId: idSchema,
  type: imageKindSchema,
  url: urlSchema,
  alt: z.string().trim().max(300).optional(),
  width: z.number().int().min(0).max(10000).optional(),
  height: z.number().int().min(0).max(10000).optional(),
  order: z.number().int().min(0).default(0),
});

export const updateGameImageSchema = z.object({
  gameId: idSchema.optional(),
  type: imageKindSchema.optional(),
  url: urlSchema.optional(),
  alt: z.string().trim().max(300).optional(),
  width: z.number().int().min(0).max(10000).optional(),
  height: z.number().int().min(0).max(10000).optional(),
  order: z.number().int().min(0).optional(),
});
