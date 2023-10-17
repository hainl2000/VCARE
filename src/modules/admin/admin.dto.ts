import {
  IsDefined,
  IsEmail,
  IsPhoneNumber,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateAdminDto {
  @IsDefined()
  @IsEmail()
  email: string;

  @IsDefined()
  @IsString()
  @MinLength(6)
  password: string;
}
