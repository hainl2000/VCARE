import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { DoctorModule } from './doctor/doctor.module';
import { AdminModule } from './admin/admin.module';
import { HospitalModule } from './hospital/hospital.module';

@Module({
  imports: [UserModule, DoctorModule, AdminModule, HospitalModule],
})
export class OpenApiModule {}
