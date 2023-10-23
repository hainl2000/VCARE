import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { doctors, users } from '@prisma/client';
import { accountWithRole } from 'src/constants/type';
import { Account } from 'src/decorators/account.decorator';
import { AuthRole } from 'src/decorators/authorization.decorator';
import {
  CreateAppointmentDto,
  ListAppointmentQuery,
  UpdateAppointmentDto,
} from './appointment.dto';
import { AppointmentService } from './appointment.service';

@Controller('appointment')
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @AuthRole('user')
  @Post()
  create(@Body() data: CreateAppointmentDto, @Account() user: users) {
    return this.appointmentService.create(data, user);
  }

  @AuthRole('user')
  @Get('check-time/:time')
  checkTime(@Param('time') time: string, @Account() user: users) {
    return this.appointmentService.checkTime(time, user);
  }

  @AuthRole()
  @Get()
  findAll(
    @Query() query: ListAppointmentQuery,
    @Account() account: accountWithRole,
  ) {
    return this.appointmentService.findAll(query, account);
  }

  @AuthRole()
  @Get('detail/:data')
  getDetail(@Param('data') data: string, @Account() account: accountWithRole) {
    return this.appointmentService.getDetail(data);
  }

  @AuthRole('doctor')
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateAppointmentDto,
    @Account() account: doctors,
  ) {
    return this.appointmentService.update(id, data, account);
  }
}
