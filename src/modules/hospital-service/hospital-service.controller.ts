import { Controller, Post, Get, Body, Query } from '@nestjs/common';
import { HospitalServiceService } from './hospital-service.service';
import { AuthRole } from 'src/decorators/authorization.decorator';
import {
  CreateHospitalServiceDto,
  HospitalServiceQuery,
} from './hospital-service.dto';
import { Account } from 'src/decorators/account.decorator';
import { hospitals } from '@prisma/client';

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
  findAll(@Query() query: HospitalServiceQuery) {
    return this.hospitalServiceService.findAll(query);
  }
}
