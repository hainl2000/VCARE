-- AlterTable
ALTER TABLE "health_check_appointment" ADD COLUMN     "periodi_examination" TEXT,
ADD COLUMN     "re_examination" TEXT;

-- CreateTable
CREATE TABLE "patient_profile" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "url" TEXT NOT NULL,

    CONSTRAINT "patient_profile_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "patient_profile" ADD CONSTRAINT "patient_profile_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
