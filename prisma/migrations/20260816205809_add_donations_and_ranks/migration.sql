-- CreateEnum
CREATE TYPE "DonationPlatform" AS ENUM ('PATREON', 'PAYPAL', 'CRYPTO');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AuditAction" ADD VALUE 'CREATE_DONATION';
ALTER TYPE "AuditAction" ADD VALUE 'UPDATE_DONATION';
ALTER TYPE "AuditAction" ADD VALUE 'DELETE_DONATION';
ALTER TYPE "AuditAction" ADD VALUE 'CREATE_RANK';
ALTER TYPE "AuditAction" ADD VALUE 'UPDATE_RANK';
ALTER TYPE "AuditAction" ADD VALUE 'DELETE_RANK';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "rankId" TEXT;

-- CreateTable
CREATE TABLE "Donation" (
    "id" TEXT NOT NULL,
    "platform" "DonationPlatform" NOT NULL,
    "url" TEXT NOT NULL,
    "label" TEXT,
    "address" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Donation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rank" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT,
    "permissions" TEXT[],
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Rank_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Donation_active_order_idx" ON "Donation"("active", "order");

-- CreateIndex
CREATE UNIQUE INDEX "Rank_name_key" ON "Rank"("name");

-- CreateIndex
CREATE INDEX "Rank_isDefault_idx" ON "Rank"("isDefault");

-- CreateIndex
CREATE INDEX "User_rankId_idx" ON "User"("rankId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_rankId_fkey" FOREIGN KEY ("rankId") REFERENCES "Rank"("id") ON DELETE SET NULL ON UPDATE CASCADE;
