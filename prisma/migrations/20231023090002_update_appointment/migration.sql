-- AlterTable
ALTER TABLE "health_check_appointment" ADD COLUMN     "doctor_id" INTEGER,
ADD COLUMN     "note" JSONB;

-- AddForeignKey
ALTER TABLE "health_check_appointment" ADD CONSTRAINT "health_check_appointment_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctors"("id") ON DELETE SET NULL ON UPDATE CASCADE;
