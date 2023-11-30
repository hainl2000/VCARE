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
import { DepartmentService } from './department.service';
import {
  CreateDepartmentDto,
  ListDepartmentQuery,
  UpdateDepartmentDto,
} from './department.dto';
import { AuthRole } from 'src/decorators/authorization.decorator';
import { Account } from 'src/decorators/account.decorator';
import { account, accountWithRole } from 'src/constants/type';
import { hospitals } from '@prisma/client';

@Controller('department')
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  @AuthRole('hospital')
  @Post()
  create(@Body() data: CreateDepartmentDto, @Account() hospital: hospitals) {
    return this.departmentService.create(data, hospital);
  }

  @AuthRole()
  @Get()
  findAll(
    @Query() query: ListDepartmentQuery,
    @Account() account: accountWithRole,
  ) {
    return this.departmentService.findAll(query, account);
  }

  @Get('detail/:id')
  getDetail(@Param('id', ParseIntPipe) id: number) {
    return this.departmentService.getDetail(id);
  }

  @Put(':id')
  @AuthRole('hospital')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateDepartmentDto,
    @Account('id') hospitalId: number,
  ) {
    return this.departmentService.update(id, data, hospitalId);
  }
}
