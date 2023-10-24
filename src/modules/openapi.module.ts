import { Module } from '@nestjs/common';
import { AdminModule } from './admin/admin.module';
import { AppointmentModule } from './appointment/appointment.module';
import { DepartmentModule } from './department/department.module';
import { DoctorModule } from './doctor/doctor.module';
import { HealthStatusModule } from './health-status/health-status.module';
import { HospitalModule } from './hospital/hospital.module';
import { UserModule } from './user/user.module';
import { DoctorRoleModule } from './doctor-role/doctor-role.module';
import { HospitalServiceModule } from './hospital-service/hospital-service.module';

@Module({
  imports: [
    UserModule,
    DoctorModule,
    AdminModule,
    HospitalModule,
    DepartmentModule,
    AppointmentModule,
    HealthStatusModule,
    DoctorRoleModule,
    HospitalServiceModule,
  ],
})
export class OpenApiModule {}
