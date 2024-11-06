/*
  Warnings:

  - A unique constraint covering the columns `[trackingId,carrier]` on the table `packages` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "packages_trackingId_carrier_key" ON "packages"("trackingId", "carrier");
