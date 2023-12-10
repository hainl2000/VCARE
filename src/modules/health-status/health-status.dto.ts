import { Type } from 'class-transformer';
import {
  IsDefined,
  IsNotEmptyObject,
  IsObject,
  IsOptional,
  IsString,
  IsPositive,
  ValidateNested,
  IsInt,
} from 'class-validator';
import { bloodType } from 'src/constants/type';
export class BloodStatus {
  @IsOptional()
  @IsString()
  type: bloodType = null;

  @IsOptional()
  @IsString()
  pressure: string = null;

  @IsOptional()
  @IsString()
  glu: string = null;

  @IsOptional()
  @IsString()
  cholesterol: string = null;

  @IsOptional()
  @IsString()
  liver_enzyme_index: string = null;
}
export class UpdateHeathStatusDto {
  //@IsNotEmptyObject()
  //@IsObject()
  //@ValidateNested()
  //@Type(() => BloodStatus)
  //blood_status: BloodStatus;
  @IsOptional()
  @IsPositive()
  @IsInt()
  height?: number;

  @IsOptional()
  @IsPositive()
  weight?: number;

  @IsOptional()
  @IsString()
  blood_type?: string;

  @IsOptional()
  @IsString()
  blood_pressure?: string;
}
