import "dotenv/config";
import { createSeedClient } from "./seed-helpers";
import { seedDemo } from "./seeds/demo";

async function main() {
  const prisma = createSeedClient();
  try {
    await seedDemo(prisma);
  } finally {
    await prisma.$disconnect();
  }
  console.log("✅ Seed demo completado.");
}

main().catch((error) => {
  console.error("❌ Error en el seed demo:", error);
  process.exit(1);
});
