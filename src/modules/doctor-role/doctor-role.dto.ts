import { IsOptional } from 'class-validator';
import { ListDto } from 'src/constants/class';

export class DoctorRoleQuery extends ListDto {
  @IsOptional()
  name?: string;
}
