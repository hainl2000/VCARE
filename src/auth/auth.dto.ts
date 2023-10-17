import { IsDefined, IsString, MinLength } from 'class-validator';
import { DoctorResponse } from 'src/modules/doctor/doctor.dto';
import { CreateUserDto, UserResponse } from 'src/modules/user/user.dto';

export class LoginDto {
  @IsDefined()
  @IsString()
  @MinLength(6)
  username: string;

  @IsDefined()
  @IsString()
  @MinLength(6)
  password: string;
}

export class RegisterDto extends CreateUserDto {}

export class AuthResponse {
  token: string;
  refreshToken: string;
  profile: UserResponse | DoctorResponse | Record<string, any>;
}
