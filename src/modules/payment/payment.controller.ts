import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { AuthRole } from 'src/decorators/authorization.decorator';
import { PaymentDto } from './payment.dto';
import { Account } from 'src/decorators/account.decorator';
import { users } from '@prisma/client';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  // @Throttle({ttl: {tt}})
  @UseGuards(ThrottlerGuard)
  @Post()
  @AuthRole('user')
  payAppointment(
    @Body() { appointment_id }: PaymentDto,
    @Account() user: users,
  ) {
    console.log('send');

    // return this.paymentService.payAppointment(appointment_id, user);
  }
}
