import { Module } from '@nestjs/common';
import { HospitalServiceService } from './hospital-service.service';
import { HospitalServiceController } from './hospital-service.controller';

@Module({
  controllers: [HospitalServiceController],
  providers: [HospitalServiceService],
})
export class HospitalServiceModule {}
