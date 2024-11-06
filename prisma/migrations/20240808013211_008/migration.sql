-- AlterTable
ALTER TABLE "photo" ADD COLUMN     "fedexDbId" INTEGER,
ADD COLUMN     "upsDbId" INTEGER;

-- CreateTable
CREATE TABLE "ups" (
    "dbId" SERIAL NOT NULL,
    "tracking_id" VARCHAR(255) NOT NULL,
    "current_status" VARCHAR(255) NOT NULL,
    "status_history" TEXT[],

    CONSTRAINT "ups_pkey" PRIMARY KEY ("dbId")
);

-- CreateTable
CREATE TABLE "fedex" (
    "dbId" SERIAL NOT NULL,
    "tracking_id" VARCHAR(255) NOT NULL,
    "current_status" VARCHAR(255) NOT NULL,
    "status_history" TEXT[],

    CONSTRAINT "fedex_pkey" PRIMARY KEY ("dbId")
);

-- CreateIndex
CREATE UNIQUE INDEX "ups_tracking_id_key" ON "ups"("tracking_id");

-- CreateIndex
CREATE UNIQUE INDEX "fedex_tracking_id_key" ON "fedex"("tracking_id");

-- AddForeignKey
ALTER TABLE "photo" ADD CONSTRAINT "photo_upsDbId_fkey" FOREIGN KEY ("upsDbId") REFERENCES "ups"("dbId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "photo" ADD CONSTRAINT "photo_fedexDbId_fkey" FOREIGN KEY ("fedexDbId") REFERENCES "fedex"("dbId") ON DELETE SET NULL ON UPDATE CASCADE;
