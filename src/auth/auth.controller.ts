import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiConsumes,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AuthResponse, LoginDto, RegisterDto } from './auth.dto';
import { AuthService } from './auth.service';

@ApiTags('auth')
@ApiConsumes('application/json')
@UsePipes(
  new ValidationPipe({
    whitelist: true,
    transform: true,
  }),
)
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ description: 'Người dùng đăng nhập' })
  @ApiOkResponse({
    type: AuthResponse,
    description: 'Đăng nhập thành công',
  })
  @Post('login')
  login(@Body() data: LoginDto) {
    return this.authService.login(data);
  }

  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ description: 'Người dùng đăng ký' })
  @ApiCreatedResponse({
    type: AuthResponse,
    description: 'Đăng ký thành công',
  })
  @Post('register')
  register(@Body() data: RegisterDto) {
    return this.authService.register(data);
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ description: 'Bác sĩ đăng nhập' })
  @ApiOkResponse({
    type: AuthResponse,
    description: 'Đăng nhập thành công',
  })
  @Post('doctor')
  loginDoctor(@Body() data: LoginDto) {
    return this.authService.loginDoctor(data);
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ description: 'Admin đăng nhập' })
  @ApiOkResponse({
    type: AuthResponse,
    description: 'Đăng nhập thành công',
  })
  @Post('admin')
  loginAdmin(@Body() data: LoginDto) {
    return this.authService.loginAdmin(data);
  }
}
