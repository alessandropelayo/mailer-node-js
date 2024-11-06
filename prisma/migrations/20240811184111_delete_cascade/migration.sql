-- DropForeignKey
ALTER TABLE "photo" DROP CONSTRAINT "photo_packagesDbId_fkey";

-- DropForeignKey
ALTER TABLE "status" DROP CONSTRAINT "status_packagesDbId_fkey";

-- AddForeignKey
ALTER TABLE "photo" ADD CONSTRAINT "photo_packagesDbId_fkey" FOREIGN KEY ("packagesDbId") REFERENCES "packages"("dbId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "status" ADD CONSTRAINT "status_packagesDbId_fkey" FOREIGN KEY ("packagesDbId") REFERENCES "packages"("dbId") ON DELETE CASCADE ON UPDATE CASCADE;
