import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiConsumes,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import {
  AuthResponse,
  ForgotPasswordQuery,
  ForgotPasswordResponse,
  LoginDto,
  RefreshQuery,
  RegisterDto,
  ResetPasswordDto,
  ResetPasswordResponse,
} from './auth.dto';
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

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ description: 'Bệnh viện đăng nhập' })
  @ApiOkResponse({
    type: AuthResponse,
    description: 'Đăng nhập thành công',
  })
  @Post('hospital')
  loginHospital(@Body() data: LoginDto) {
    return this.authService.loginHospital(data);
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ description: 'Người dùng quên mật khẩu' })
  @ApiOkResponse({
    type: ForgotPasswordResponse,
    description: 'Yêu cầu thành công',
  })
  @ApiQuery({
    name: 'username',
    required: false,
    type: String,
  })
  @Get('forgot')
  forgotPassword(@Query() { username }: ForgotPasswordQuery) {
    return this.authService.forgotPassword(username);
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ description: 'Người dùng  mật khẩu' })
  @ApiOkResponse({
    type: ResetPasswordResponse,
    description: 'Tạo mật khẩu mới thành công',
  })
  @Post('reset-password')
  resetPassword(@Body() data: ResetPasswordDto) {
    return this.authService.resetPassword(data);
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ description: 'Refresh token' })
  @ApiOkResponse({
    type: AuthResponse,
    description: 'Yêu cầu thành công',
  })
  @ApiQuery({
    name: 'token',
    required: false,
    type: String,
  })
  @Get('refresh')
  refreshAccount(@Query() { token }: RefreshQuery) {
    return this.authService.refreshAccount(token);
  }
}
