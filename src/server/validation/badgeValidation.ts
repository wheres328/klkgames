import { z } from "zod";
import { idSchema, slugSchema, urlSchema } from "./common";

export const createBadgeSchema = z.object({
  slug: slugSchema,
  name: z.string().trim().min(1, "El nombre no puede estar vacío").max(80, "Nombre demasiado largo"),
  description: z.string().trim().max(400, "La descripción es demasiado larga").default(""),
  image: urlSchema,
});

export const updateBadgeSchema = z.object({
  slug: slugSchema.optional(),
  name: z.string().trim().min(1, "El nombre no puede estar vacío").max(80, "Nombre demasiado largo").optional(),
  description: z.string().trim().max(400, "La descripción es demasiado larga").optional(),
  image: urlSchema.optional(),
});

export const awardBadgeSchema = z.object({
  badgeId: idSchema,
  reason: z
    .string()
    .trim()
    .max(300, "El motivo es demasiado largo")
    .optional()
    .default(""),
});

export const revokeBadgeSchema = z.object({
  badgeId: idSchema,
});
