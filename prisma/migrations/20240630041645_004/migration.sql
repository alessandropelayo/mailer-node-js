/*
  Warnings:

  - A unique constraint covering the columns `[id]` on the table `emails` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "emails_id_key" ON "emails"("id");
