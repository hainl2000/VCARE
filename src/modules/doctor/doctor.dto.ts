import {
  IsDefined,
  IsEmail,
  IsInt,
  IsOptional,
  IsPhoneNumber,
  IsPositive,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { HospitalDetail } from '../hospital/hospital.dto';
import { ApiProperty, ApiResponseProperty } from '@nestjs/swagger';

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
    required: true,
  })
  @IsDefined()
  @IsInt()
  @IsPositive()
  department_id: number;

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
