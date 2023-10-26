import { ApiProperty, ApiResponseProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDefined,
  IsEmail,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { HospitalDetail } from '../hospital/hospital.dto';
import { Type } from 'class-transformer';

export class CreateDoctorDto {
  @ApiProperty({
    description: 'email',
    example: 'test@gmail.com',
    required: true,
  })
  @IsDefined()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'sđt',
    example: '0978547536',
    required: true,
  })
  @IsDefined()
  @Matches(/(0[3|5|7|8|9])+([0-9]{8})\b/g, {
    message: 'phone must be a valid number',
  })
  phone: string;

  @ApiProperty({
    description: 'mã chứng chỉ hành nghề',
    example: '...',
    required: true,
  })
  @IsDefined()
  @IsString()
  @MinLength(10)
  practicing_certificate_code: string;

  @ApiProperty({
    description: 'mã bác sĩ',
    example: '...',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(10)
  code?: string;

  @IsOptional()
  @IsInt()
  @IsPositive()
  hospital_id: number;

  @ApiProperty({
    description: 'id khoa khám',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  department_id?: number;

  @ApiProperty({
    description: 'id dịch vụ',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  service_id?: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  role_id?: number;

  @IsOptional()
  @IsString()
  full_name?: string;

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

export class UpdateDoctorDto {
  @IsDefined()
  @IsInt()
  @IsPositive()
  doctor_id: number;

  @IsOptional()
  @IsString()
  practicing_certificate_code?: string;

  @IsOptional()
  @IsString()
  full_name?: string;

  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsInt()
  @IsPositive()
  department_id?: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  service_id?: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  role_id?: number;

  @IsOptional()
  @IsBoolean()
  gender: boolean;

  @IsOptional()
  @IsString()
  avatar?: string;
}

export class DoctorResponse {
  @ApiResponseProperty({
    example: '1',
  })
  id: number;
  @ApiResponseProperty({
    example: 'Trần Quốc Du',
  })
  full_name?: string;

  @ApiResponseProperty({
    example: 'url',
  })
  avatar?: string;
  @ApiResponseProperty({
    example: 'true(nam) | false(nữ)',
  })
  gender?: boolean;
  @ApiResponseProperty({
    example: '0987554643',
  })
  phone?: string;
  @ApiResponseProperty({
    example: 'test@gmail.com',
  })
  email?: string;
  @ApiResponseProperty({
    example: '...',
  })
  practicing_certificate_code?: string;
  @ApiResponseProperty({
    example: '...',
  })
  code?: string;
  @ApiResponseProperty({
    example: '...',
  })
  hospital: HospitalDetail;
}

export class GetDoctorDetail {
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  doctor_id: number;
}
