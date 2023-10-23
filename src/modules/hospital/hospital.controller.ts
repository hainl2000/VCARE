import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { HospitalService } from './hospital.service';
import { Account } from 'src/decorators/account.decorator';
import { admins } from '@prisma/client';
import { AuthRole } from 'src/decorators/authorization.decorator';
import { CreateHospitalDto, ListHospitalQuery } from './hospital.dto';

@Controller('hospital')
export class HospitalController {
  constructor(private readonly hospitalService: HospitalService) {}

  @AuthRole('admin')
  @Post()
  create(@Account() account: admins, @Body() data: CreateHospitalDto) {
    return this.hospitalService.create(account, data);
  }

  @Get()
  findAll(@Query() query: ListHospitalQuery) {
    return this.hospitalService.findAll(query);
  }

  @Get('detail/:id')
  getDetail(@Param('id', ParseIntPipe) id: number) {
    return this.hospitalService.getDetail(id);
  }
}
