/*
  Warnings:

  - You are about to drop the column `tracking_id` on the `fedex` table. All the data in the column will be lost.
  - You are about to drop the column `tracking_id` on the `photo` table. All the data in the column will be lost.
  - You are about to drop the column `tracking_id` on the `ups` table. All the data in the column will be lost.
  - You are about to drop the column `tracking_id` on the `usps` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[trackingId]` on the table `fedex` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[trackingId]` on the table `ups` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[trackingId]` on the table `usps` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `trackingId` to the `fedex` table without a default value. This is not possible if the table is not empty.
  - Added the required column `trackingId` to the `status` table without a default value. This is not possible if the table is not empty.
  - Added the required column `trackingId` to the `ups` table without a default value. This is not possible if the table is not empty.
  - Added the required column `trackingId` to the `usps` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "fedex_tracking_id_key";

-- DropIndex
DROP INDEX "photo_tracking_id_key";

-- DropIndex
DROP INDEX "ups_tracking_id_key";

-- DropIndex
DROP INDEX "usps_tracking_id_key";

-- AlterTable
ALTER TABLE "fedex" DROP COLUMN "tracking_id",
ADD COLUMN     "trackingId" VARCHAR(255) NOT NULL;

-- AlterTable
ALTER TABLE "photo" DROP COLUMN "tracking_id";

-- AlterTable
ALTER TABLE "status" ADD COLUMN     "trackingId" VARCHAR(255) NOT NULL;

-- AlterTable
ALTER TABLE "ups" DROP COLUMN "tracking_id",
ADD COLUMN     "trackingId" VARCHAR(255) NOT NULL;

-- AlterTable
ALTER TABLE "usps" DROP COLUMN "tracking_id",
ADD COLUMN     "trackingId" VARCHAR(255) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "fedex_trackingId_key" ON "fedex"("trackingId");

-- CreateIndex
CREATE UNIQUE INDEX "ups_trackingId_key" ON "ups"("trackingId");

-- CreateIndex
CREATE UNIQUE INDEX "usps_trackingId_key" ON "usps"("trackingId");
