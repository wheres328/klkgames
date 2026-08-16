import { z } from "zod";
import { clearedUrlSchema, idSchema } from "./common";

export const userIdSchema = z.object({ id: idSchema });

export const usernameSchema = z
  .string()
  .trim()
  .min(3, "El nombre de usuario debe tener al menos 3 caracteres")
  .max(30, "El nombre de usuario es demasiado largo")
  .regex(/^[a-zA-Z0-9_]+$/, "Solo letras, números y guiones bajos");

export const userRoleSchema = z.enum(["USER", "MODERATOR", "ADMIN"]);

export const createUserSchema = z.object({
  username: usernameSchema,
  name: z.string().trim().min(1).max(80),
  email: z.string().trim().email("Debe ser un email válido").max(255),
  passwordHash: z.string().min(8).max(255).optional(),
  image: clearedUrlSchema,
  cover: clearedUrlSchema,
  bio: z.string().trim().max(500).optional(),
  role: userRoleSchema.default("USER"),
});

export const updateUserSchema = z.object({
  username: usernameSchema.optional(),
  name: z.string().trim().min(1).max(80).optional(),
  email: z.string().trim().email("Debe ser un email válido").max(255).optional(),
  passwordHash: z.string().min(8).max(255).optional(),
  image: clearedUrlSchema.optional(),
  cover: clearedUrlSchema.optional(),
  bio: z.string().trim().max(500).optional(),
  role: userRoleSchema.optional(),
});

export const softDeleteUserSchema = z.object({
  id: idSchema,
});
