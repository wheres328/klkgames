import { z } from "zod";

// Los IDs los genera Prisma (@default(cuid())), así que validamos forma
// genérica (longitud razonable) en lugar de un formato CUID concreto.
export const idSchema = z.string().min(1).max(64);

export const contentSchema = z
  .string()
  .trim()
  .min(1, "El comentario no puede estar vacío")
  .max(4000, "El comentario es demasiado largo");

// Slug kebab-case: letras minúsculas, números y guiones simples.
export const slugSchema = z
  .string()
  .trim()
  .min(1, "El slug no puede estar vacío")
  .max(120, "El slug es demasiado largo")
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "El slug solo admite minúsculas, números y guiones");

export const urlSchema = z
  .string()
  .trim()
  .url("Debe ser una URL válida")
  .max(2048, "La URL es demasiado larga");

// URL opcional que admite cadena vacía (se transforma a null) para "quitar" la imagen.
export const clearedUrlSchema = z
  .union([z.literal(""), urlSchema])
  .nullable()
  .optional()
  .transform((value) => (value === "" ? null : value));

// Paginación genérica reutilizable por servicios de listado.
export const paginationSchema = z.object({
  page: z.number().int().min(1).max(100000).default(1),
  pageSize: z.number().int().min(1).max(100).default(20),
});
