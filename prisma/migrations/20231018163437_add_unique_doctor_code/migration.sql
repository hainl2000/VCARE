/*
  Warnings:

  - A unique constraint covering the columns `[practicing_certificate_code]` on the table `doctors` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[code]` on the table `doctors` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "doctors_practicing_certificate_code_key" ON "doctors"("practicing_certificate_code");

-- CreateIndex
CREATE UNIQUE INDEX "doctors_code_key" ON "doctors"("code");
