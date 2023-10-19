import { ApiProperty, ApiResponseProperty } from '@nestjs/swagger';
import { IsDefined, IsString, MinLength } from 'class-validator';
import { DoctorResponse } from 'src/modules/doctor/doctor.dto';
import { CreateUserDto, UserResponse } from 'src/modules/user/user.dto';

export class LoginDto {
  @ApiProperty({
    description: 'email/sđt',
    example: 'test@gmail.com | 0986342856',
    required: true,
  })
  @IsDefined()
  @IsString()
  @MinLength(6)
  username: string;

  @ApiProperty({
    description: 'mật khẩu',
    example: '123456',
    required: true,
  })
  @IsDefined()
  @IsString()
  @MinLength(6)
  password: string;
}

export class RegisterDto extends CreateUserDto {}
export class ForgotPasswordQuery {
  @ApiProperty({
    description: 'email/sđt',
    example: 'test@gmail.com | 0986342856',
    required: true,
  })
  @IsDefined()
  username: string;
}

export class ResetPasswordDto {
  @ApiProperty({
    description: 'email/sđt',
    example: 'test@gmail.com | 0986342856',
    required: true,
  })
  @IsDefined()
  username: string;

  @ApiProperty({
    description: 'mã otp',
    example: '666666',
    required: true,
  })
  @IsDefined()
  otp: string;

  @ApiProperty({
    description: 'mật khẩu mới',
    example: '123456',
    required: true,
  })
  @IsDefined()
  password: string;
}

export class RefreshQuery {
  @ApiProperty({
    description: 'refresh token',
    example: 'ey...',
    required: true,
  })
  @IsDefined()
  token: string;
}
export class AuthResponse {
  @ApiResponseProperty({
    example: 'ey....',
  })
  token: string;
  @ApiResponseProperty({
    example: 'ey....',
  })
  refreshToken: string;
  profile: UserResponse;
}
export class ResetPasswordResponse {
  @ApiResponseProperty({
    example: true,
  })
  status: boolean;
  @ApiResponseProperty({
    example: 'Tạo mật khẩu mới thành công',
  })
  message: string;
}

export class ForgotPasswordResponse {
  @ApiResponseProperty({
    example: true,
  })
  status: boolean;
  @ApiResponseProperty({
    example: 'OTP đã được gửi đến email của bạn',
  })
  message: string;
}
