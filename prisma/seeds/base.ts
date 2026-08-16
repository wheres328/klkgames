import { Role } from "../../src/generated/prisma/client";
import type { PrismaClient } from "../../src/generated/prisma/client";
import { genres } from "./mock/genres";
import { platforms } from "./mock/platforms";

export const ADMIN_PASSWORD_HASH = "$2b$10$K/GvRtgH7DCO2J6/gfioE.Qo.SSVihvY8Gn0ap2pLUbZy9QzTCwHa";

export async function seedBase(prisma: PrismaClient): Promise<void> {
  console.log("🌱 Sembrando estructura base...");

  // 1. Géneros (upsert por slug)
  for (const genre of genres) {
    await prisma.genre.upsert({
      where: { slug: genre.slug },
      update: {
        name: genre.name,
        image: genre.image,
        description: genre.description,
        accentFrom: genre.accentFrom,
        accentTo: genre.accentTo,
        gameCount: genre.gameCount,
      },
      create: {
        slug: genre.slug,
        name: genre.name,
        image: genre.image,
        description: genre.description,
        accentFrom: genre.accentFrom,
        accentTo: genre.accentTo,
        gameCount: genre.gameCount,
      },
    });
  }

  // 2. Plataformas (upsert por slug)
  for (const platform of platforms) {
    await prisma.platform.upsert({
      where: { slug: platform.slug },
      update: { name: platform.name, shortName: platform.shortName },
      create: { slug: platform.slug, name: platform.name, shortName: platform.shortName },
    });
  }

  // 3. Admin Vortex (upsert por email) + cuenta de login (Better Auth usa Account.password)
  const admin = await prisma.user.upsert({
    where: { email: "admin@vortex.com" },
    update: {
      username: "admin",
      name: "Administrador Vortex",
      role: Role.ADMIN,
      emailVerified: true,
      passwordHash: ADMIN_PASSWORD_HASH,
    },
    create: {
      email: "admin@vortex.com",
      username: "admin",
      name: "Administrador Vortex",
      role: Role.ADMIN,
      emailVerified: true,
      passwordHash: ADMIN_PASSWORD_HASH,
    },
  });

  const adminAccount = await prisma.account.findFirst({
    where: { userId: admin.id, providerId: "credential" },
  });
  if (!adminAccount) {
    await prisma.account.create({
      data: {
        userId: admin.id,
        providerId: "credential",
        accountId: admin.id,
        password: ADMIN_PASSWORD_HASH,
      },
    });
  }

  // 4. Medallas base (upsert por slug)
  const starterBadges = [
    {
      slug: "pionero",
      name: "Pionero",
      description: "Entre los primeros en descubrir Vortex.",
      image: "https://picsum.photos/seed/badge-pionero/120/120",
    },
    {
      slug: "coleccionista",
      name: "Coleccionista",
      description: "Guarda juegos en favoritos y construye tu colección.",
      image: "https://picsum.photos/seed/badge-coleccionista/120/120",
    },
    {
      slug: "voz-de-la-comunidad",
      name: "Voz de la comunidad",
      description: "Participa activamente en comentarios y valoraciones.",
      image: "https://picsum.photos/seed/badge-comunidad/120/120",
    },
    {
      slug: "critico",
      name: "Crítico",
      description: "Valora juegos con criterio y ayuda a la comunidad.",
      image: "https://picsum.photos/seed/badge-critico/120/120",
    },
    {
      slug: "veterano",
      name: "Veterano",
      description: "Reconocimiento por trayectoria y constancia.",
      image: "https://picsum.photos/seed/badge-veterano/120/120",
    },
  ] as const;

  for (const badge of starterBadges) {
    await prisma.badge.upsert({
      where: { slug: badge.slug },
      update: { name: badge.name, description: badge.description, image: badge.image },
      create: badge,
    });
  }
}
