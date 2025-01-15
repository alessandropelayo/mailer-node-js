-- CreateEnum
CREATE TYPE "AccessLevel" AS ENUM ('NO_ACCESS', 'BASIC', 'ADVANCED', 'FULL_ACCESS');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "accessLevel" "AccessLevel" NOT NULL DEFAULT 'NO_ACCESS';
