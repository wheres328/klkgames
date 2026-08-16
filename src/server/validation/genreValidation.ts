import { z } from "zod";
import { clearedUrlSchema, idSchema } from "./common";
import { GENRE_PATTERN_STYLES, MAX_PATTERN_SEED } from "@/lib/genre-art";

export const genreIdSchema = z.object({ id: idSchema });

const hexColorSchema = z
  .string()
  .trim()
  .regex(/^#([0-9a-fA-F]{6})$/, "Debe ser un color hexadecimal (#rrggbb)");

const genrePatternStyleSchema = z.enum(GENRE_PATTERN_STYLES);

// Se recorta cualquier valor mayor que el máximo de la columna Int de
// PostgreSQL en vez de rechazarlo (clientes con bundle antiguo podían mandar
// valores >2147483646; el formulario actual ya genera dentro del rango).
const genrePatternSeedSchema = z.preprocess(
  (value) => {
    if (typeof value === "number" && !Number.isNaN(value)) {
      return Math.min(value, MAX_PATTERN_SEED);
    }
    if (typeof value === "string" && value.trim() !== "") {
      const parsed = Number(value);
      if (!Number.isNaN(parsed)) return Math.min(parsed, MAX_PATTERN_SEED);
    }
    return value;
  },
  z
    .number()
    .int("La semilla debe ser un número entero")
    .min(0)
    .max(MAX_PATTERN_SEED),
);

// Normaliza el slug antes de validarlo: quita acentos, pasa a minúsculas y
// convierte espacios/símbolos en guiones (p. ej. "Acción & Co" -> "accion-co").
const genreSlugSchema = z
  .string()
  .trim()
  .min(1, "El slug no puede estar vacío")
  .max(120, "El slug es demasiado largo")
  .transform((value) =>
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, ""),
  )
  .pipe(
    z
      .string()
      .min(1, "El slug no puede estar vacío")
      .regex(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "El slug solo admite letras, números y guiones (los acentos se normalizan)",
      ),
  );

const genreFields = {
  slug: genreSlugSchema,
  name: z.string().trim().min(1, "El nombre no puede estar vacío").max(80),
  // Imagen opcional: cadena vacía => null (se usa el patrón vectorial).
  image: clearedUrlSchema,
  description: z.string().trim().min(1, "La descripción no puede estar vacía").max(500),
};

export const createGenreSchema = z.object({
  ...genreFields,
  accentFrom: hexColorSchema.default("#7c3aed"),
  accentTo: hexColorSchema.default("#06b6d4"),
  patternStyle: genrePatternStyleSchema.optional(),
  patternSeed: genrePatternSeedSchema.nullable().optional(),
});

// Actualización parcial SIN heredar los defaults del create: solo aplica los
// campos que el formulario envía, para no pisar colores/valores existentes.
export const updateGenreSchema = z.object({
  slug: genreSlugSchema.optional(),
  name: z.string().trim().min(1, "El nombre no puede estar vacío").max(80).optional(),
  image: clearedUrlSchema.optional(),
  description: z.string().trim().min(1, "La descripción no puede estar vacía").max(500).optional(),
  accentFrom: hexColorSchema.optional(),
  accentTo: hexColorSchema.optional(),
  patternStyle: genrePatternStyleSchema.optional(),
  patternSeed: genrePatternSeedSchema.nullable().optional(),
});
