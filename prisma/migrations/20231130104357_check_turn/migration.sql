/*
  Warnings:

  - You are about to drop the column `time` on the `health_check_appointment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "health_check_appointment" DROP COLUMN "time",
ADD COLUMN     "order" INTEGER NOT NULL DEFAULT -1,
ALTER COLUMN "external_code" DROP NOT NULL,
ALTER COLUMN "external_code" DROP DEFAULT,
ALTER COLUMN "external_code" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "hospital_department" ADD COLUMN     "start_order" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "time_per_turn" INTEGER NOT NULL DEFAULT 5;
