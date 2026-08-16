import { z } from "zod";
import { idSchema, slugSchema } from "./common";

export const platformIdSchema = z.object({ id: idSchema });
export const platformSlugSchema = z.object({ slug: slugSchema });

export const createPlatformSchema = z.object({
  slug: slugSchema,
  name: z.string().trim().min(1).max(80),
  shortName: z.string().trim().min(1).max(40),
});

export const updatePlatformSchema = createPlatformSchema.partial();
