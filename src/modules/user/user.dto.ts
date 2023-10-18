import { ApiProperty, ApiResponseProperty } from '@nestjs/swagger';
import {
  IsDefined,
  IsEmail,
  IsPhoneNumber,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
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
    example: '0978534375',
    required: true,
  })
  @IsDefined()
  @IsPhoneNumber()
  phone: string;

  @ApiProperty({
    description: 'bảo hiểm xã hội',
    example: '454534583495',
    required: true,
  })
  @IsDefined()
  @IsString()
  @MinLength(10)
  social_insurance_number: string;

  @ApiProperty({
    description: 'căn cước công dân/chứng minh nhân dân',
    example: '030045744985',
    required: true,
  })
  @IsDefined()
  @IsString()
  @MinLength(10)
  identity_number: string;

  @ApiProperty({
    description: 'mật khẩu',
    example: '0978534375',
    required: true,
  })
  @IsDefined()
  @IsString()
  @MinLength(6)
  password: string;
}

export class UserResponse {
  @ApiResponseProperty({
    example: 1,
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
    example: 'true: nam | false: nữ',
  })
  gender?: boolean;

  @ApiResponseProperty({
    example: 'date',
  })
  dob?: Date;
  @ApiResponseProperty({
    example: '4584358213493',
  })
  identity_number?: string;
  @ApiResponseProperty({
    example: '4584358213493',
  })
  social_insurance_number?: string;
  @ApiResponseProperty({
    example: '0983454687',
  })
  phone?: string;

  @ApiResponseProperty({
    example: 'test@gmail.com',
  })
  email?: string;
}
