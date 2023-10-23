import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDefined,
  IsInt,
  IsNotEmptyObject,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { ListDto } from 'src/constants/class';

export class CreateAppointmentDto {
  @IsDefined()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  department_id: number;

  @IsDefined()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  hospital_id: number;

  @IsDefined()
  @IsString()
  medical_condition: string;

  @IsDefined()
  @IsString()
  time_in_string: string;

  @IsDefined()
  @IsString()
  identity_number: string;

  @IsDefined()
  @IsString()
  social_insurance_number: string;

  @IsDefined()
  @IsString()
  address: string;
}

export class ListAppointmentQuery extends ListDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  startFrom?: string;

  @IsOptional()
  @IsString()
  endAt?: string;

  @IsOptional()
  @IsString()
  external_code?: string;
}

export class UpdateAppointmentDto {
  @IsOptional()
  @IsBoolean()
  finished?: boolean;

  @IsOptional()
  @IsNotEmptyObject()
  result?: Record<string, string>;

  @IsOptional()
  @IsNotEmptyObject()
  note?: Record<string, string>;
}
