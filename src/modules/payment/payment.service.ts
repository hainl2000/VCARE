import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { users } from '@prisma/client';
import { PrismaService } from 'src/shared/prisma.service';

@Injectable()
export class PaymentService {
  constructor(private readonly prisma: PrismaService) {}

  async payAppointment(appointmentId: number, user: users) {
    let [appointment, wallet] = await Promise.all([
      this.prisma.health_check_appointment.findUnique({
        where: { id: appointmentId },
      }),
      this.prisma.wallet.findUnique({ where: { user_id: user.id } }),
    ]);

    if (!appointment) {
      throw new NotFoundException('Yêu cầu không tồn tại');
    }
    if (!appointment.finished) {
      throw new BadRequestException('Chưa khám xong');
    }
    if (appointment.user_id !== user.id) {
      throw new BadRequestException('Không thể thanh toán yêu cầu này');
    }

    if (appointment.fee_paid) {
      throw new BadRequestException('Yêu cầu này đã được đóng phí');
    }

    if (appointment.fee === 0 || !appointment.fee) {
      await this.prisma.health_check_appointment.update({
        where: { id: appointmentId },
        data: { fee_paid: true },
      });

      return {
        status: 'success',
        amount: 0,
      };
    }

    if (!wallet) {
      wallet = await this.prisma.wallet.create({
        data: { user_id: user.id },
      });
    }

    if (wallet.remain < appointment.fee) {
      throw new BadRequestException('Số dư không đủ');
    }
  }
}
