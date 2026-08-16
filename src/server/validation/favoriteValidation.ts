import { z } from "zod";
import { idSchema } from "./common";

export const favoriteSchema = z.object({
  gameId: idSchema,
});
