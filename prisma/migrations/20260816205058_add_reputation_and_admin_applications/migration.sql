-- CreateEnum
CREATE TYPE "ReputationReason" AS ENUM ('COMMENT_CREATED', 'COMMENT_LIKE_RECEIVED', 'GAME_RATED', 'ADMIN_AWARD');

-- CreateEnum
CREATE TYPE "AdminApplicationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AuditAction" ADD VALUE 'AWARD_REPUTATION';
ALTER TYPE "AuditAction" ADD VALUE 'GRANT_ROLE';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "reputation" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "ReputationLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "delta" INTEGER NOT NULL,
    "reason" "ReputationReason" NOT NULL,
    "referenceId" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReputationLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminApplication" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "reputationAtSubmit" INTEGER NOT NULL,
    "status" "AdminApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "reviewNote" TEXT,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminApplication_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ReputationLog_userId_createdAt_idx" ON "ReputationLog"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ReputationLog_userId_reason_referenceId_key" ON "ReputationLog"("userId", "reason", "referenceId");

-- CreateIndex
CREATE INDEX "AdminApplication_status_createdAt_idx" ON "AdminApplication"("status", "createdAt");

-- CreateIndex
CREATE INDEX "AdminApplication_userId_idx" ON "AdminApplication"("userId");

-- CreateIndex
CREATE INDEX "User_reputation_idx" ON "User"("reputation");

-- AddForeignKey
ALTER TABLE "ReputationLog" ADD CONSTRAINT "ReputationLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminApplication" ADD CONSTRAINT "AdminApplication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminApplication" ADD CONSTRAINT "AdminApplication_reviewedBy_fkey" FOREIGN KEY ("reviewedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
