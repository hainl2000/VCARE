import { Body, Controller, Post, Get, Param, ParseIntPipe } from '@nestjs/common';
import { HealthStatusService } from './health-status.service';
import { AuthRole } from 'src/decorators/authorization.decorator';
import { UpdateHeathStatusDto } from './health-status.dto';
import { Account } from 'src/decorators/account.decorator';
import { accountWithRole } from 'src/constants/type';
import { users } from '@prisma/client';

@Controller('health-status')
export class HealthStatusController {
  constructor(private readonly healthStatusService: HealthStatusService) {}

  @Post()
  @AuthRole('user')
  update(@Body() data: UpdateHeathStatusDto, @Account() user: users) {
    return this.healthStatusService.update(data, user);
  }

  @Get()
  @AuthRole('user')
  getStatus(@Account() user: users) {
    return this.healthStatusService.getHealthStatus(user);
  }

  @Get(':id')
  @AuthRole('doctor')
  getUserStatus(@Param('id', ParseIntPipe) userId: number) {
    return this.healthStatusService.getUserStatus(userId);
  }
}
