/*
  Warnings:

  - The `result_image` column on the `use_service` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "use_service" DROP COLUMN "result_image",
ADD COLUMN     "result_image" TEXT[];
