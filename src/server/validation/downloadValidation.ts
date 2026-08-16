import { z } from "zod";
import { idSchema, urlSchema } from "./common";

export const downloadIdSchema = z.object({ id: idSchema });

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

export const downloadTypeSchema = z.enum(["STORE", "WISHLIST", "DOWNLOAD", "CLIENT", "OTHER"]);

export const createDownloadSchema = z.object({
  gameId: idSchema,
  store: downloadStoreSchema,
  type: downloadTypeSchema.default("STORE"),
  name: z.string().trim().min(1).max(120),
  url: urlSchema,
  platformId: idSchema.optional(),
  version: z.string().trim().max(40).optional(),
  size: z.string().trim().max(40).optional(),
  isOfficial: z.boolean().default(true),
  order: z.number().int().min(0).max(1000).default(0),
});

export const updateDownloadSchema = z.object({
  gameId: idSchema.optional(),
  store: downloadStoreSchema.optional(),
  type: downloadTypeSchema.optional(),
  name: z.string().trim().min(1).max(120).optional(),
  url: urlSchema.optional(),
  platformId: idSchema.optional(),
  version: z.string().trim().max(40).optional(),
  size: z.string().trim().max(40).optional(),
  isOfficial: z.boolean().optional(),
  order: z.number().int().min(0).max(1000).optional(),
});
