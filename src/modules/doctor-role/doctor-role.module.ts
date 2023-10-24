import { Module } from '@nestjs/common';
import { DoctorRoleService } from './doctor-role.service';
import { DoctorRoleController } from './doctor-role.controller';

@Module({
  controllers: [DoctorRoleController],
  providers: [DoctorRoleService],
})
export class DoctorRoleModule {}
