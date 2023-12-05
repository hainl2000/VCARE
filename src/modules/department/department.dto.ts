import { Type } from 'class-transformer';
import {
  IsDefined,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  MinLength,
} from 'class-validator';
import { ListDto } from 'src/constants/class';

export class CreateDepartmentDto {
  @IsDefined()
  @IsString()
  @MinLength(3)
  name: string;

  @IsOptional()
  @IsInt()
  @IsPositive()
  time_per_turn?: number = 15;

  @IsOptional()
  @IsString()
  room?: string = null;
}

export class ListDepartmentQuery extends ListDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  hospital_id: number;
}

export class UpdateDepartmentDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsInt()
  @IsPositive()
  time_per_turn?: number = 15;
  @IsOptional()
  @IsString()
  room?: string = null;
}
