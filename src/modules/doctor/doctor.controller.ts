import { Body, Controller, Post } from '@nestjs/common';
import { DoctorService } from './doctor.service';
import { Auth, AuthRole } from 'src/decorators/authorization.decorator';
import { CreateDoctorDto } from './doctor.dto';
import { Account } from 'src/decorators/account.decorator';

@Controller('doctor')
export class DoctorController {
  constructor(private readonly doctorService: DoctorService) {}

  @AuthRole('admin')
  @Post()
  create(@Body() data: CreateDoctorDto, @Account() account: any) {
    return this.doctorService.create(data);
  }
}
