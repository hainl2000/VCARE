import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AdminModule } from 'src/modules/admin/admin.module';
import { DoctorModule } from 'src/modules/doctor/doctor.module';
import { UserModule } from 'src/modules/user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { HospitalModule } from 'src/modules/hospital/hospital.module';

@Module({
  imports: [JwtModule, UserModule, DoctorModule, AdminModule, HospitalModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
