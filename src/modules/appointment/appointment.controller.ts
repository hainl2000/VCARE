import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
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

  @Get('assign/:id')
  @AuthRole('doctor')
  @SetMetadata(DROLE_KEY, ['specialis'])
  async assignDoctor(
    @Account() doctor: doctors,
    @Param('id', ParseIntPipe) appointmentId: number,
  ) {
    return this.appointmentService.assignDoctor(doctor, appointmentId);
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
    const appointment = await this.appointmentService.findById(id);
    if (!appointment) {
      throw new NotFoundException('Không tìm thấy lịch hẹn');
    }
    if (!appointment.doctor_id) {
      throw new BadRequestException('Chưa đăng ký tiếp nhận lịch hẹn này');
    }
    if (appointment.doctor_id !== account.id) {
      throw new BadRequestException('Không thể khám lịch hẹn này');
    }

    if (appointment.finished) {
      throw new BadRequestException('Lịch hẹn đã khám xong');
    }
    if (!!services && services.length > 0) {
      const fee = await this.appointmentService.addServices(
        appointment,
        services,
      );
      updateData.fee = fee;
    }
    return this.appointmentService.update(id, updateData);
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
