import "dotenv/config";
import { createSeedClient } from "./seed-helpers";
import { seedBase } from "./seeds/base";

// IMPORTANTE: `db:seed` solo crea la estructura base (géneros, plataformas,
// admin y medallas). El contenido de ejemplo (juegos, artículos, comentarios,
// valoraciones, favoritos y usuarios demo) se siembra aparte con `db:seed:demo`
// para que no reaparezca por accidente al correr el seed normal.
async function main() {
  const prisma = createSeedClient();
  try {
    await seedBase(prisma);
  } finally {
    await prisma.$disconnect();
  }
  console.log("✅ Seed completado.");
}

main().catch((error) => {
  console.error("❌ Error en el seed:", error);
  process.exit(1);
});
