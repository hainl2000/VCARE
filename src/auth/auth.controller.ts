import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() data: LoginDto) {
    return this.authService.login(data);
  }

  @Post('register')
  register(@Body() data: RegisterDto) {
    return this.authService.register(data);
  }

  @Post('doctor')
  loginDoctor(@Body() data: LoginDto) {
    return this.authService.loginDoctor(data);
  }

  @Post('admin')
  loginAdmin(@Body() data: LoginDto) {
    return this.authService.loginAdmin(data);
  }
}
