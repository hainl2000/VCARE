import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  Put,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { HospitalServiceService } from './hospital-service.service';
import { AuthRole } from 'src/decorators/authorization.decorator';
import {
  CreateHospitalServiceDto,
  HospitalServiceQuery,
  UpdateHospitalServiceDto,
} from './hospital-service.dto';
import { Account } from 'src/decorators/account.decorator';
import { hospitals } from '@prisma/client';
import { accountWithRole } from 'src/constants/type';

@Controller('hospital-service')
export class HospitalServiceController {
  constructor(
    private readonly hospitalServiceService: HospitalServiceService,
  ) {}

  @AuthRole('hospital')
  @Post()
  create(
    @Body() data: CreateHospitalServiceDto,
    @Account() hospital: hospitals,
  ) {
    return this.hospitalServiceService.create(data, hospital);
  }

  @AuthRole()
  @Get()
  findAll(
    @Query() query: HospitalServiceQuery,
    @Account() account: accountWithRole,
  ) {
    if (account.role === 'doctor') {
      query.hospital_id = account['hospital_id'];
    }
    if (account.role === 'hospital') {
      query.hospital_id = account['id'];
    }
    return this.hospitalServiceService.findAll(query, account);
  }

  @AuthRole('hospital')
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) serviceId: number,
    @Body() data: UpdateHospitalServiceDto,
    @Account() hospital: hospitals,
  ) {
    return this.hospitalServiceService.update(serviceId, data, hospital);
  }
}
