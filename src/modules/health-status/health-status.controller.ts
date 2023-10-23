import { Controller } from '@nestjs/common';
import { HealthStatusService } from './health-status.service';

@Controller('health-status')
export class HealthStatusController {
  constructor(private readonly healthStatusService: HealthStatusService) {}
}
