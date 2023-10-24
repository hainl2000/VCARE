/*
  Warnings:

  - You are about to drop the column `result` on the `health_check_appointment` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "doctors" DROP CONSTRAINT "doctors_department_id_fkey";

-- AlterTable
ALTER TABLE "doctors" ADD COLUMN     "service_id" INTEGER,
ALTER COLUMN "department_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "health_check_appointment" DROP COLUMN "result",
ADD COLUMN     "conclude" JSONB,
ADD COLUMN     "fee" DOUBLE PRECISION,
ADD COLUMN     "fee_paid" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "medicine" JSONB,
ALTER COLUMN "note" SET DATA TYPE TEXT;

-- CreateTable
CREATE TABLE "wallet" (
    "id" VARCHAR NOT NULL DEFAULT nanoid(),
    "user_id" INTEGER NOT NULL,
    "remain" DOUBLE PRECISION NOT NULL DEFAULT 5000000,

    CONSTRAINT "wallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wallet_transaction" (
    "id" SERIAL NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "note" TEXT,
    "ref_id" INTEGER NOT NULL,
    "wallet_id" VARCHAR,

    CONSTRAINT "wallet_transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hospital_services" (
    "id" SERIAL NOT NULL,
    "hospital_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "fee" DOUBLE PRECISION,
    "template" JSONB DEFAULT '{}',

    CONSTRAINT "hospital_services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "use_service" (
    "appointment_id" INTEGER NOT NULL,
    "service_id" INTEGER NOT NULL,
    "doctor_id" INTEGER,
    "result" JSONB NOT NULL DEFAULT '{}',

    CONSTRAINT "use_service_pkey" PRIMARY KEY ("appointment_id","service_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "wallet_user_id_key" ON "wallet"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "wallet_transaction_ref_id_key" ON "wallet_transaction"("ref_id");

-- CreateIndex
CREATE UNIQUE INDEX "hospital_services_name_hospital_id_key" ON "hospital_services"("name", "hospital_id");

-- AddForeignKey
ALTER TABLE "wallet" ADD CONSTRAINT "wallet_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallet_transaction" ADD CONSTRAINT "wallet_transaction_ref_id_fkey" FOREIGN KEY ("ref_id") REFERENCES "health_check_appointment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallet_transaction" ADD CONSTRAINT "wallet_transaction_wallet_id_fkey" FOREIGN KEY ("wallet_id") REFERENCES "wallet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doctors" ADD CONSTRAINT "doctors_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "hospital_department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doctors" ADD CONSTRAINT "doctors_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "hospital_services"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hospital_services" ADD CONSTRAINT "hospital_services_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "use_service" ADD CONSTRAINT "use_service_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "health_check_appointment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "use_service" ADD CONSTRAINT "use_service_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "hospital_services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "use_service" ADD CONSTRAINT "use_service_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctors"("id") ON DELETE SET NULL ON UPDATE CASCADE;
