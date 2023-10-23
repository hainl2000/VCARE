-- AlterTable
ALTER TABLE "health_check_appointment" ADD COLUMN     "finished" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "result" JSONB;
