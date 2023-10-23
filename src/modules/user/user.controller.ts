import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Put,
} from '@nestjs/common';
import { users } from '@prisma/client';
import { Account } from 'src/decorators/account.decorator';
import { AuthRole } from 'src/decorators/authorization.decorator';
import { UserService } from './user.service';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { UpdateUserDto, UserResponse } from './user.dto';
import { getAccountSafeData } from 'src/utils';

@ApiTags('user')
@ApiBearerAuth('authorization')
@ApiConsumes('application/json')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @AuthRole('user')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ description: 'Lấy thông tin người dùng' })
  @ApiOkResponse({
    type: UserResponse,
    description: 'Yêu cầu thành công',
  })
  @Get('profile')
  getProfile(@Account() account: users) {
    return getAccountSafeData(account);
  }

  @AuthRole('user')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ description: 'Cập nhật thông tin người dùng' })
  @ApiCreatedResponse({
    type: UserResponse,
    description: 'Yêu cầu thành công',
  })
  @Put()
  update(@Account() account: users, @Body() data: UpdateUserDto) {
    return this.userService.update(account, data);
  }
}
