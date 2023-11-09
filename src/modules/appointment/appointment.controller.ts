import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  SetMetadata,
} from '@nestjs/common';
import { doctors, users } from '@prisma/client';
import { DROLE_KEY, accountWithRole } from 'src/constants/type';
import { Account } from 'src/decorators/account.decorator';
import { AuthRole } from 'src/decorators/authorization.decorator';
import {
  CreateAppointmentDto,
  GetAppointmentDetailQuery,
  ListAppointmentQuery,
  PatientHistoryQuery,
  SearchAppointDto,
  UpdateAppointmentDto,
  UpdateServiceResultDto,
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

  @AuthRole('hospital', 'doctor', 'user')
  @SetMetadata(DROLE_KEY, ['reception', 'specialis', 'service'])
  @Get()
  findAll(
    @Query() query: ListAppointmentQuery,
    @Account() account: accountWithRole,
  ) {
    return this.appointmentService.findAll(query, account);
  }

  @AuthRole()
  @Get('detail/:id')
  getDetail(
    @Param('id', ParseIntPipe) appointmentId: number,
    @Account() account: accountWithRole,
  ) {
    return this.appointmentService.getDetail(appointmentId, account);
  }

  @AuthRole('doctor')
  @SetMetadata(DROLE_KEY, ['specialis'])
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateAppointmentDto,
    @Account() account: doctors,
  ) {
    const { services, ...updateData } = data;
    if (!!services && services.length > 0) {
      const fee = await this.appointmentService.addServices(id, services);
      updateData.fee = fee;
    }
    return this.appointmentService.update(id, updateData, account);
  }

  @AuthRole('doctor')
  @SetMetadata(DROLE_KEY, ['service'])
  @Post('service')
  updateServiceResult(
    @Body() data: UpdateServiceResultDto,
    @Account() doctor: doctors,
  ) {
    return this.appointmentService.updateServiceResult(data, doctor);
  }

  @AuthRole('doctor')
  @SetMetadata(DROLE_KEY, ['service'])
  @Get('search-appointment')
  searchAppointment(
    @Query() query: SearchAppointDto,
    @Account() doctor: doctors,
  ) {
    return this.appointmentService.searchAppointment(query, doctor);
  }

  @AuthRole('doctor', 'user', 'hospital')
  @SetMetadata(DROLE_KEY, ['specialis'])
  @Get('patient-history')
  getPatientHistory(
    @Query() query: PatientHistoryQuery,
    account: accountWithRole,
  ) {
    return this.appointmentService.getPatientHistory(query, account);
  }
}
