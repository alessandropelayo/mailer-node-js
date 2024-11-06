/*
  Warnings:

  - You are about to drop the column `fedexDbId` on the `photo` table. All the data in the column will be lost.
  - You are about to drop the column `upsDbId` on the `photo` table. All the data in the column will be lost.
  - You are about to drop the column `uspsDbId` on the `photo` table. All the data in the column will be lost.
  - You are about to drop the column `fedexDbId` on the `status` table. All the data in the column will be lost.
  - You are about to drop the column `statusText` on the `status` table. All the data in the column will be lost.
  - You are about to drop the column `upsDbId` on the `status` table. All the data in the column will be lost.
  - You are about to drop the column `uspsDbId` on the `status` table. All the data in the column will be lost.
  - You are about to drop the `fedex` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ups` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `usps` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `delivered` to the `status` table without a default value. This is not possible if the table is not empty.
  - Added the required column `deliveryDate` to the `status` table without a default value. This is not possible if the table is not empty.
  - Added the required column `outForDelivery` to the `status` table without a default value. This is not possible if the table is not empty.
  - Added the required column `time` to the `status` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "photo" DROP CONSTRAINT "photo_fedexDbId_fkey";

-- DropForeignKey
ALTER TABLE "photo" DROP CONSTRAINT "photo_upsDbId_fkey";

-- DropForeignKey
ALTER TABLE "photo" DROP CONSTRAINT "photo_uspsDbId_fkey";

-- DropForeignKey
ALTER TABLE "status" DROP CONSTRAINT "status_fedexDbId_fkey";

-- DropForeignKey
ALTER TABLE "status" DROP CONSTRAINT "status_upsDbId_fkey";

-- DropForeignKey
ALTER TABLE "status" DROP CONSTRAINT "status_uspsDbId_fkey";

-- AlterTable
ALTER TABLE "photo" DROP COLUMN "fedexDbId",
DROP COLUMN "upsDbId",
DROP COLUMN "uspsDbId",
ADD COLUMN     "packagesDbId" INTEGER;

-- AlterTable
ALTER TABLE "status" DROP COLUMN "fedexDbId",
DROP COLUMN "statusText",
DROP COLUMN "upsDbId",
DROP COLUMN "uspsDbId",
ADD COLUMN     "delivered" BOOLEAN NOT NULL,
ADD COLUMN     "deliveryDate" DATE NOT NULL,
ADD COLUMN     "outForDelivery" BOOLEAN NOT NULL,
ADD COLUMN     "packagesDbId" INTEGER,
ADD COLUMN     "time" TEXT NOT NULL,
ALTER COLUMN "updatedAt" DROP DEFAULT,
ALTER COLUMN "trackingId" SET DATA TYPE TEXT;

-- DropTable
DROP TABLE "fedex";

-- DropTable
DROP TABLE "ups";

-- DropTable
DROP TABLE "usps";

-- CreateTable
CREATE TABLE "packages" (
    "dbId" SERIAL NOT NULL,
    "trackingId" TEXT NOT NULL,
    "carrier" TEXT NOT NULL,

    CONSTRAINT "packages_pkey" PRIMARY KEY ("dbId")
);

-- AddForeignKey
ALTER TABLE "photo" ADD CONSTRAINT "photo_packagesDbId_fkey" FOREIGN KEY ("packagesDbId") REFERENCES "packages"("dbId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "status" ADD CONSTRAINT "status_packagesDbId_fkey" FOREIGN KEY ("packagesDbId") REFERENCES "packages"("dbId") ON DELETE SET NULL ON UPDATE CASCADE;
