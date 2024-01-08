import { BadRequestException } from '@nestjs/common';
import { ApiProperty, ApiResponseProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsDefined,
  IsEmail,
  Matches,
  IsString,
  MinLength,
  IsOptional,
  IsBoolean,
  IsDate,
  IsNotEmpty,
} from 'class-validator';
import * as dayjs from 'dayjs';
import { dateRegex } from 'src/constants/regex';

export class CreateUserDto {
  // @IsDefined()

  @IsOptional()
  @IsEmail()
  email: string;

  @IsDefined()
  @Matches(/(0[3|5|7|8|9])+([0-9]{8})\b/g, {
    message: 'phone must be a valid number',
  })
  phone: string;

  @IsOptional()
  @IsString()
  social_insurance_number: string;

  @IsOptional()
  @IsString()
  identity_number: string;
  @IsDefined()
  @IsString()
  password: string;
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  full_name?: string;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsBoolean()
  gender?: boolean;

  @IsOptional()
  @IsDate()
  @Transform(({ value }) => {
    if (typeof value !== 'string' || !value.match(dateRegex)) {
      throw new BadRequestException('dob invalid');
    }
    return dayjs(value).toDate();
  })
  dob?: Date;

  @IsOptional()
  @IsString()
  identity_number?: string;

  @IsOptional()
  @IsString()
  social_insurance_number?: string;

  @IsOptional()
  @IsString()
  address?: string;
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

export class UpdatePatientProfileDto {
  @IsNotEmpty()
  url: string;
}
