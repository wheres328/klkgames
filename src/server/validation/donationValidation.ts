import { z } from "zod";

const optionalText = (max: number, message: string) =>
  z
    .string()
    .trim()
    .max(max, message)
    .optional()
    .or(z.literal(""))
    .transform((value) => (value === "" ? undefined : value));

export const donationSchema = z.object({
  platform: z.enum(["PATREON", "PAYPAL", "CRYPTO"], {
    message: "Selecciona una plataforma de pago.",
  }),
  url: z
    .string()
    .trim()
    .url("Introduce un enlace válido que empiece por https://")
    .max(500, "El enlace es demasiado largo."),
  label: optionalText(80, "La etiqueta es demasiado larga."),
  address: optionalText(300, "La dirección o dato de pago es demasiado largo."),
  order: z.coerce.number().int("El orden debe ser un número entero.").min(0).max(1000).default(0),
  active: z.boolean().optional(),
});

export type DonationInput = z.infer<typeof donationSchema>;
