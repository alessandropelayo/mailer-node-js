-- CreateTable
CREATE TABLE "photo" (
    "dbId" SERIAL NOT NULL,
    "filename" TEXT NOT NULL,
    "filesize" INTEGER NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fileLocation" TEXT NOT NULL,
    "tracking_id" VARCHAR(255) NOT NULL,
    "uspsDbId" INTEGER,

    CONSTRAINT "photo_pkey" PRIMARY KEY ("dbId")
);

-- CreateTable
CREATE TABLE "usps" (
    "dbId" SERIAL NOT NULL,
    "tracking_id" VARCHAR(255) NOT NULL,
    "current_status" VARCHAR(255) NOT NULL,
    "status_history" TEXT[],

    CONSTRAINT "usps_pkey" PRIMARY KEY ("dbId")
);

-- CreateIndex
CREATE UNIQUE INDEX "photo_tracking_id_key" ON "photo"("tracking_id");

-- CreateIndex
CREATE UNIQUE INDEX "usps_tracking_id_key" ON "usps"("tracking_id");

-- AddForeignKey
ALTER TABLE "photo" ADD CONSTRAINT "photo_uspsDbId_fkey" FOREIGN KEY ("uspsDbId") REFERENCES "usps"("dbId") ON DELETE SET NULL ON UPDATE CASCADE;
