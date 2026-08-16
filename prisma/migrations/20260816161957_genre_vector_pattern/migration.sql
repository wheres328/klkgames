-- AlterTable
ALTER TABLE "Genre" ADD COLUMN     "patternSeed" INTEGER,
ADD COLUMN     "patternStyle" TEXT,
ALTER COLUMN "image" DROP NOT NULL;
