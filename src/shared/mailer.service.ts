import { MailerService } from '@nestjs-modules/mailer';
import { BadRequestException, Injectable } from '@nestjs/common';
@Injectable()
export class SendMailService {
  private from = 'baogamemail@gmail.com';
  constructor(private readonly mailService: MailerService) {}

  async sendOTPMail(
    receiverAddress: string,
    otp: string,
    otpExpired: string,
    mailTitle?: string,
  ) {
    try {
      await this.mailService.sendMail({
        to: receiverAddress,
        from: this.from,
        subject: mailTitle || 'Mã OTP VCARE',
        template: 'otp',
        context: {
          otp,
          otpExpired,
        },
      });
    } catch (error) {
      throw new BadRequestException(
        'Yêu cầu của bạn tạm thời khô ng thực hiện được. Vui lòng thử lại sau',
      );
    }
  }
}
