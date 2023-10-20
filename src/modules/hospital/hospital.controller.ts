import { Body, Controller, Post } from '@nestjs/common';
import { HospitalService } from './hospital.service';
import { Account } from 'src/decorators/account.decorator';
import { admins } from '@prisma/client';
import { AuthRole } from 'src/decorators/authorization.decorator';
import { CreateHospitalDto } from './hospital.dto';

@Controller('hospital')
export class HospitalController {
  constructor(private readonly hospitalService: HospitalService) {}

  @AuthRole('admin')
  @Post()
  create(@Account() account: admins, @Body() data: CreateHospitalDto) {
    return this.hospitalService.create(account, data);
  }
}
