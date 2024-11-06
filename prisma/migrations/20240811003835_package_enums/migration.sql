/*
  Warnings:

  - You are about to drop the column `uploadedAt` on the `photo` table. All the data in the column will be lost.
  - You are about to drop the column `delivered` on the `status` table. All the data in the column will be lost.
  - You are about to drop the column `outForDelivery` on the `status` table. All the data in the column will be lost.
  - Changed the type of `carrier` on the `packages` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `updatedAt` to the `photo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `status` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `time` on the `status` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Carrier" AS ENUM ('UPS', 'FedEx', 'USPS');

-- CreateEnum
CREATE TYPE "PackageStatus" AS ENUM ('Pending', 'Shipped', 'OutForDelivery', 'Delivered', 'Returned');

-- AlterTable
ALTER TABLE "packages" DROP COLUMN "carrier",
ADD COLUMN     "carrier" "Carrier" NOT NULL;

-- AlterTable
ALTER TABLE "photo" DROP COLUMN "uploadedAt",
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "status" DROP COLUMN "delivered",
DROP COLUMN "outForDelivery",
ADD COLUMN     "status" "PackageStatus" NOT NULL,
ALTER COLUMN "deliveryDate" SET DATA TYPE TIMESTAMP(3),
DROP COLUMN "time",
ADD COLUMN     "time" TIMESTAMP(3) NOT NULL;
