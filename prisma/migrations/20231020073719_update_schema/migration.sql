/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `hospitals` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[phone]` on the table `hospitals` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `hospitals` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone` to the `hospitals` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "hospitals" ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "phone" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "address" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "hospitals_email_key" ON "hospitals"("email");

-- CreateIndex
CREATE UNIQUE INDEX "hospitals_phone_key" ON "hospitals"("phone");
