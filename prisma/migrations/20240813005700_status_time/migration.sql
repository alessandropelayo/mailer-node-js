/*
  Warnings:

  - Added the required column `statusTime` to the `status` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "status" ADD COLUMN     "statusTime" TIMESTAMP(3) NOT NULL;
