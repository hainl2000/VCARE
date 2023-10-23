/*
  Warnings:

  - Added the required column `department_id` to the `doctors` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "roles" AS ENUM ('user', 'admin', 'doctor', 'hospital');

-- AlterTable
ALTER TABLE "doctors" ADD COLUMN     "department_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "health_status" JSONB DEFAULT '{}';

-- CreateTable
CREATE TABLE "health_history" (
    "id" SERIAL NOT NULL,
    "status" JSONB DEFAULT '{}',
    "update_by" INTEGER NOT NULL,
    "role" "roles" NOT NULL,
    "update_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "health_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hospital_department" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "hospital_id" INTEGER NOT NULL,

    CONSTRAINT "hospital_department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "health_check_appointment" (
    "id" SERIAL NOT NULL,
    "hospital_id" INTEGER NOT NULL,
    "department_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "external_code" VARCHAR NOT NULL DEFAULT nanoid(),
    "medical_condition" TEXT NOT NULL,
    "time" TIMESTAMP(3) NOT NULL,
    "time_in_string" TEXT NOT NULL,

    CONSTRAINT "health_check_appointment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "hospital_department_name_hospital_id_key" ON "hospital_department"("name", "hospital_id");

-- CreateIndex
CREATE UNIQUE INDEX "health_check_appointment_external_code_key" ON "health_check_appointment"("external_code");

-- AddForeignKey
ALTER TABLE "doctors" ADD CONSTRAINT "doctors_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "hospital_department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hospital_department" ADD CONSTRAINT "hospital_department_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "health_check_appointment" ADD CONSTRAINT "health_check_appointment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "health_check_appointment" ADD CONSTRAINT "health_check_appointment_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "health_check_appointment" ADD CONSTRAINT "health_check_appointment_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "hospital_department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
