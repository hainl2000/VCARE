import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { AuthRole } from 'src/decorators/authorization.decorator';
import { PaymentDto } from './payment.dto';
import { Account } from 'src/decorators/account.decorator';
import { users } from '@prisma/client';
import { SkipThrottle, Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { RateLimitingGuard } from 'src/guards/rate-limiting.guard';

@SkipThrottle({ default: false })
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  @UseGuards(RateLimitingGuard)
  @AuthRole('user')
  payAppointment(
    @Account() user: users,
    @Body() { appointment_id }: PaymentDto,
  ) {
    // return this.paymentService.payAppointment(appointment_id, user);
  }
}
