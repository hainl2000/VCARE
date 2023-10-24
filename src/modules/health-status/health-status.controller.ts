import { Body, Controller, Post } from '@nestjs/common';
import { HealthStatusService } from './health-status.service';
import { AuthRole } from 'src/decorators/authorization.decorator';
import { UpdateHeathStatusDto } from './health-status.dto';
import { Account } from 'src/decorators/account.decorator';
import { accountWithRole } from 'src/constants/type';

@Controller('health-status')
export class HealthStatusController {
  constructor(private readonly healthStatusService: HealthStatusService) {}

  @Post()
  @AuthRole('user', 'doctor')
  update(
    @Body() data: UpdateHeathStatusDto,
    @Account() account: accountWithRole,
  ) {}
}
