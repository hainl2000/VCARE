import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { DoctorRoleService } from './doctor-role.service';
import { AuthRole } from 'src/decorators/authorization.decorator';
import { DoctorRoleQuery } from './doctor-role.dto';

@Controller('doctor-role')
export class DoctorRoleController {
  constructor(private readonly doctorRoleService: DoctorRoleService) {}

  @AuthRole('admin')
  @Post()
  create(@Body() { name }: { name: string }) {
    return this.doctorRoleService.create(name);
  }

  @AuthRole()
  @Get()
  findAll(@Query() query: DoctorRoleQuery) {
    return this.doctorRoleService.findAll(query);
  }
}
