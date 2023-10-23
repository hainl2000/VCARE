import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsPositive, Max } from 'class-validator';

export class ListDto {
  @IsOptional()
  @IsInt()
  @Max(50)
  @IsPositive()
  @Type(() => Number)
  pageSize?: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  pageIndex?: number;
}
