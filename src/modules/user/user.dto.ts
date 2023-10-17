import {
  IsDefined,
  IsEmail,
  IsPhoneNumber,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsDefined()
  @IsEmail()
  email: string;

  @IsDefined()
  @IsPhoneNumber()
  phone: string;

  @IsDefined()
  @IsString()
  @MinLength(10)
  social_insurance_number: string;

  @IsDefined()
  @IsString()
  @MinLength(10)
  identity_number: string;

  @IsDefined()
  @IsString()
  @MinLength(6)
  password: string;
}

export class UserResponse {
  id: number;
  full_name?: string;
  avatar?: string;
  gender?: boolean;
  dob?: Date;
  identity_number?: string;
  social_insurance_number?: string;
  phone?: string;
  email?: string;
}
