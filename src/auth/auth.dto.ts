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
