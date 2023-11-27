import { Type } from 'class-transformer';
import {
  IsDefined,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { ListDto } from 'src/constants/class';
import { isStringObject } from 'util/types';

export class CreateHospitalServiceDto {
  @IsDefined()
  @IsString()
  name: string;

  @IsOptional()
  @IsObject()
  template?: Record<string, any>;
}

export class UpdateHospitalServiceDto {
  @IsOptional()
  @IsString()
  name: string;
}

export class HospitalServiceQuery extends ListDto {
  @IsOptional()
  name?: string;

  @IsOptional()
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  hospital_id: number;
}

export class CreateMedicalServiceDto {
  @IsNotEmpty()
  @IsInt()
  service_id: number;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsPositive()
  fee?: number;

  @IsOptional()
  @IsString()
  room?: string;
}

export class UpdateMedicalServiceDto {
  @IsNotEmpty()
  @IsInt()
  id: number;

  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsPositive()
  fee?: number;

  @IsOptional()
  @IsString()
  room?: string;
}

export class MedicalServiceQuery extends ListDto {
  @IsOptional()
  name?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  serviceId?: number;
}
