import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Account } from 'src/decorators/account.decorator';
import { AuthRole } from 'src/decorators/authorization.decorator';
import { CreateDoctorDto, DoctorResponse } from './doctor.dto';
import { DoctorService } from './doctor.service';
import {
  ApiConsumes,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('doctor')
@ApiConsumes('application/json')
@UsePipes(
  new ValidationPipe({
    whitelist: true,
    transform: true,
  }),
)
@Controller('doctor')
export class DoctorController {
  constructor(private readonly doctorService: DoctorService) {}

  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ description: 'Tạo tài khoản bác sĩ' })
  @ApiCreatedResponse({
    type: DoctorResponse,
    description: 'Tạo tài khoản thành công thành công',
  })
  @AuthRole('admin')
  @Post()
  create(@Body() data: CreateDoctorDto, @Account() account: any) {
    return this.doctorService.create(data);
  }
}
