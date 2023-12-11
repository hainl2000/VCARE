import { Type } from 'class-transformer';
import {
  IsDefined,
  IsEmail,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { ListDto } from 'src/constants/class';

export class CreateHospitalDto {
  @IsDefined()
  @IsString()
  @MinLength(3)
  name: string;
  @IsDefined()
  @IsString()
  @MinLength(6)
  address: string;

  @IsDefined()
  @IsEmail()
  email: string;

  @IsDefined()
  @Matches(/(0[3|5|7|8|9])+([0-9]{8})\b/g, {
    message: 'phone must be a valid number',
  })
  phone: string;

  @IsDefined()
  @IsString()
  @MinLength(6)
  password: string;
}

export class UpdateHospitalDto {
  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  address: string;

  @IsOptional()
  @IsString()
  information: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsInt()
  hospital_id?: number;

  @IsOptional()
  @IsPositive()
  open_time?: number;

  @IsOptional()
  @IsPositive()
  close_time?: number;

  @IsOptional()
  @IsPositive()
  lunch_break_start?: number;

  @IsOptional()
  @IsPositive()
  lunch_break_end?: number;
}

export class ListHospitalQuery extends ListDto {
  @IsOptional()
  @IsString()
  name?: string;
}

export class GetHospitalDoctors extends ListDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  hospital_id?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  role_id?: number;
}

export class HospitalDetail {}
