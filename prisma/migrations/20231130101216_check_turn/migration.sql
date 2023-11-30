/*
  Warnings:

  - You are about to drop the column `time` on the `health_check_appointment` table. All the data in the column will be lost.
  - Added the required column `order` to the `health_check_appointment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "health_check_appointment" DROP COLUMN "time",
ADD COLUMN     "order" INTEGER NOT NULL,
ALTER COLUMN "external_code" DROP NOT NULL,
ALTER COLUMN "external_code" DROP DEFAULT,
ALTER COLUMN "external_code" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "hospital_department" ADD COLUMN     "start_order" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "time_per_turn" INTEGER NOT NULL DEFAULT 5;
