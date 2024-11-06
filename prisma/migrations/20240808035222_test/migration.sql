/*
  Warnings:

  - You are about to drop the column `current_status` on the `fedex` table. All the data in the column will be lost.
  - You are about to drop the column `status_history` on the `fedex` table. All the data in the column will be lost.
  - You are about to drop the column `current_status` on the `ups` table. All the data in the column will be lost.
  - You are about to drop the column `status_history` on the `ups` table. All the data in the column will be lost.
  - You are about to drop the column `current_status` on the `usps` table. All the data in the column will be lost.
  - You are about to drop the column `status_history` on the `usps` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "fedex" DROP COLUMN "current_status",
DROP COLUMN "status_history";

-- AlterTable
ALTER TABLE "ups" DROP COLUMN "current_status",
DROP COLUMN "status_history";

-- AlterTable
ALTER TABLE "usps" DROP COLUMN "current_status",
DROP COLUMN "status_history";

-- CreateTable
CREATE TABLE "status" (
    "dbId" SERIAL NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "statusText" TEXT NOT NULL,
    "uspsDbId" INTEGER,
    "upsDbId" INTEGER,
    "fedexDbId" INTEGER,

    CONSTRAINT "status_pkey" PRIMARY KEY ("dbId")
);

-- AddForeignKey
ALTER TABLE "status" ADD CONSTRAINT "status_uspsDbId_fkey" FOREIGN KEY ("uspsDbId") REFERENCES "usps"("dbId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "status" ADD CONSTRAINT "status_upsDbId_fkey" FOREIGN KEY ("upsDbId") REFERENCES "ups"("dbId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "status" ADD CONSTRAINT "status_fedexDbId_fkey" FOREIGN KEY ("fedexDbId") REFERENCES "fedex"("dbId") ON DELETE SET NULL ON UPDATE CASCADE;
