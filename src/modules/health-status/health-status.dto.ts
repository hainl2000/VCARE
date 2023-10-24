import { Type } from 'class-transformer';
import {
  IsDefined,
  IsNotEmptyObject,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
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
  @IsNotEmptyObject()
  @IsObject()
  @ValidateNested()
  @Type(() => BloodStatus)
  blood_status: BloodStatus;
}
