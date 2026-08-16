import { z } from "zod";
import { idSchema, slugSchema, urlSchema } from "./common";

export const articleIdSchema = z.object({ id: idSchema });
export const articleSlugSchema = z.object({ slug: slugSchema });

export const articleStatusSchema = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);

export const createArticleSchema = z.object({
  slug: slugSchema,
  title: z.string().trim().min(1).max(200),
  excerpt: z.string().trim().min(1).max(500),
  image: urlSchema,
  category: z.string().trim().min(1).max(80),
  content: z.array(z.string().trim().min(1).max(5000)).max(200).default([]),
  readTime: z.number().int().min(0).max(600).default(5),
  status: articleStatusSchema.default("DRAFT"),
  authorId: idSchema,
  tagIds: z.array(idSchema).max(30).default([]),
  relatedGameIds: z.array(idSchema).max(20).default([]),
});

export const updateArticleSchema = z.object({
  slug: slugSchema.optional(),
  title: z.string().trim().min(1).max(200).optional(),
  excerpt: z.string().trim().min(1).max(500).optional(),
  image: urlSchema.optional(),
  category: z.string().trim().min(1).max(80).optional(),
  content: z.array(z.string().trim().min(1).max(5000)).max(200).optional(),
  readTime: z.number().int().min(0).max(600).optional(),
  status: articleStatusSchema.optional(),
  authorId: idSchema.optional(),
  tagIds: z.array(idSchema).max(30).optional(),
  relatedGameIds: z.array(idSchema).max(20).optional(),
});
