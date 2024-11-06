/*
  Warnings:

  - Added the required column `recentStatusTime` to the `packages` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "packages" ADD COLUMN     "recentStatusTime" TIMESTAMP(3) NOT NULL;
