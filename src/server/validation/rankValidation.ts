import { z } from "zod";
import { PERMISSION_CATALOG } from "@/server/services/permissionService";

const validCodes = new Set(PERMISSION_CATALOG.map((permission) => permission.code));

export const rankSchema = z.object({
  name: z.string().trim().min(1, "El nombre no puede estar vacío.").max(50, "Nombre demasiado largo."),
  description: z
    .string()
    .trim()
    .max(300, "La descripción es demasiado larga.")
    .optional()
    .or(z.literal(""))
    .transform((value) => (value === "" ? undefined : value)),
  color: z
    .string()
    .trim()
    .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "El color debe ser un hex válido, p. ej. #ff6600.")
    .optional()
    .or(z.literal(""))
    .transform((value) => (value === "" ? undefined : value)),
  permissions: z
    .array(z.string())
    .max(50, "Demasiados permisos.")
    .refine((codes) => codes.every((code) => validCodes.has(code)), {
      message: "Contiene permisos no reconocidos.",
    })
    .default([]),
  isDefault: z.boolean().optional(),
});

export type RankInput = z.infer<typeof rankSchema>;
