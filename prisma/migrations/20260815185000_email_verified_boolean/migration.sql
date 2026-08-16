-- Convertir "emailVerified" de timestamp nullable a booleano (modelo Better Auth).
-- Los usuarios que ya tenían verificación pasan a true; el resto, false.
ALTER TABLE "User" ADD COLUMN "emailVerified_new" BOOLEAN NOT NULL DEFAULT false;

UPDATE "User"
SET "emailVerified_new" = true
WHERE "emailVerified" IS NOT NULL;

ALTER TABLE "User" DROP COLUMN "emailVerified";

ALTER TABLE "User" RENAME COLUMN "emailVerified_new" TO "emailVerified";
