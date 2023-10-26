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
import { HospitalService } from './hospital.service';
import { Account } from 'src/decorators/account.decorator';
import { admins } from '@prisma/client';
import { AuthRole } from 'src/decorators/authorization.decorator';
import {
  CreateHospitalDto,
  GetHospitalDoctors,
  ListHospitalQuery,
  UpdateHospitalDto,
} from './hospital.dto';
import { accountWithRole } from 'src/constants/type';

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

  @AuthRole('admin', 'hospital')
  @Put()
  update(@Account() account: accountWithRole, @Body() data: UpdateHospitalDto) {
    if (account.role === 'hospital') {
      data.hospital_id = account.id;
    }
    const { hospital_id, ...updateData } = data;
    return this.hospitalService.update(hospital_id, updateData);
  }

  @AuthRole('admin', 'hospital')
  @Get('doctors')
  getDoctors(
    @Query() query: GetHospitalDoctors,
    @Account() account: accountWithRole,
  ) {
    if (account.role === 'hospital') {
      query.hospital_id = account.id;
    }
    return this.hospitalService.getDoctors(query);
  }
}
