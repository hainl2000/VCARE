import {
  IsDefined,
  IsEmail,
  IsInt,
  IsPhoneNumber,
  IsPositive,
  IsString,
  MinLength,
} from 'class-validator';
import { HospitalDetail } from '../hospital/hospital.dto';

export class CreateDoctorDto {
  @IsDefined()
  @IsEmail()
  email: string;

  @IsDefined()
  @IsPhoneNumber()
  phone: string;

  @IsDefined()
  @IsString()
  @MinLength(10)
  practicing_certificate_code: string;

  @IsDefined()
  @IsString()
  @MinLength(10)
  code: string;

  @IsDefined()
  @IsInt()
  @IsPositive()
  hospital_id: number;

  @IsDefined()
  @IsString()
  @MinLength(6)
  password: string;
}

export class DoctorResponse {
  id: number;
  full_name?: string;
  avatar?: string;
  gender?: boolean;
  phone?: string;
  email?: string;
  practicing_certificate_code?: string;
  code?: string;
  hospital: HospitalDetail;
}
