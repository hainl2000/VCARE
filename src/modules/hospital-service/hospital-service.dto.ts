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

export class CreateHospitalServiceDto {
  @IsDefined()
  @IsString()
  name: string;

  @IsOptional()
  @IsObject()
  template?: Record<string, any>;

  @IsOptional()
  fee?: number = null;
}

export class UpdateHospitalServiceDto {
  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsObject()
  template?: Record<string, any>;

  @IsOptional()
  fee?: number;
}

export class HospitalServiceQuery extends ListDto {
  @IsOptional()
  name?: string;

  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  hospital_id: number;
}
