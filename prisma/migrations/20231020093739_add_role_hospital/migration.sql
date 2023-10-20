/*
  Warnings:

  - You are about to drop the column `created_by` on the `doctors` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `hospitals` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `address` to the `hospitals` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `hospitals` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `hospitals` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "doctors" DROP COLUMN "created_by";

-- AlterTable
ALTER TABLE "hospitals" ADD COLUMN     "address" TEXT NOT NULL,
ADD COLUMN     "change_history" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "password" TEXT NOT NULL,
ADD COLUMN     "security_key" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "hospitals_name_key" ON "hospitals"("name");
