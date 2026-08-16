import { betterAuth } from "better-auth";
import { prismaAdapter } from "@better-auth/prisma-adapter";
import bcrypt from "bcrypt";
import { db } from "@/lib/db";

export const auth = betterAuth({
  database: prismaAdapter(db, { provider: "postgresql" }),
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  emailAndPassword: {
    enabled: true,
    // La BD usa hashes bcrypt ($2b$10$...); better-auth por defecto usa scrypt.
    password: {
      hash: async (password) => {
        return await bcrypt.hash(password, 10);
      },
      verify: async ({ hash, password }) => {
        return await bcrypt.compare(password, hash);
      },
    },
  },
  user: {
    additionalFields: {
      username: { type: "string", required: false },
      // El rol solo puede cambiarse desde el servidor (aprobación/candidatura,
      // edición admin). Prohibimos que el cliente lo fije al registrarse.
      role: { type: "string", required: false, input: false },
    },
  },
  session: {
    // Sesión de 7 días, renovación tras 24h de uso continuo.
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    cookieCache: { enabled: true, maxAge: 5 * 60 },
  },
  advanced: {
    cookiePrefix: "vortex",
  },
});
