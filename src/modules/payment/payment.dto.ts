import { IsInt, IsNotEmpty, IsPositive } from 'class-validator';

export class PaymentDto {
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  appointment_id: number;
}
