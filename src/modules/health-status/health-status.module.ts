import { Module } from '@nestjs/common';
import { HealthStatusService } from './health-status.service';
import { HealthStatusController } from './health-status.controller';

@Module({
  controllers: [HealthStatusController],
  providers: [HealthStatusService],
})
export class HealthStatusModule {}
