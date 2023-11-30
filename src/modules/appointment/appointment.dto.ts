import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsDefined,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import * as dayjs from 'dayjs';
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
  @Transform(({ value }) => {
    return dayjs(value).format('YYYY-MM-DD');
  })
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
  startFrom?: string;

  @IsOptional()
  @IsString()
  endAt?: string;

  @IsOptional()
  @IsString()
  search_value?: string;
}

export class PatientHistoryQuery extends ListDto {
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  patientId: number;
}

export class SearchAppointDto {
  @IsNotEmpty()
  @IsString()
  search_value: string;
}

export class UpdateAppointmentDto {
  @IsOptional()
  @IsBoolean()
  finished?: boolean;

  @IsOptional()
  @IsString()
  medicine?: string;

  @IsOptional()
  @IsString()
  conclude?: string;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsInt({ each: true })
  @IsPositive({ each: true })
  services: number[];

  fee?: number;
}

export class UpdateServiceResultDto {
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  appointment_id: number;

  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  service_id: number;

  @IsNotEmpty()
  @IsString({ each: true })
  result_image: string[];
}

export class GetAppointmentDetailQuery {
  @IsOptional()
  @IsString()
  data?: string;
}
