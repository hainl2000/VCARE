/*
  Warnings:

  - You are about to drop the column `fee` on the `hospital_services` table. All the data in the column will be lost.
  - You are about to drop the column `template` on the `hospital_services` table. All the data in the column will be lost.
  - You are about to drop the column `result` on the `use_service` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "use_service" DROP CONSTRAINT "use_service_service_id_fkey";

-- AlterTable
ALTER TABLE "hospital_services" DROP COLUMN "fee",
DROP COLUMN "template";

-- AlterTable
ALTER TABLE "use_service" DROP COLUMN "result",
ADD COLUMN     "result_image" TEXT;

-- CreateTable
CREATE TABLE "medical_services" (
    "id" SERIAL NOT NULL,
    "service_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "fee" DOUBLE PRECISION,
    "room" TEXT,

    CONSTRAINT "medical_services_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "medical_services" ADD CONSTRAINT "medical_services_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "hospital_services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "use_service" ADD CONSTRAINT "use_service_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "medical_services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
