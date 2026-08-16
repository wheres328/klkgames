import { z } from "zod";
import { idSchema } from "./common";

export const rateGameSchema = z.object({
  gameId: idSchema,
  value: z.number().int().min(1).max(5),
});

export const removeRatingSchema = z.object({
  gameId: idSchema,
});
