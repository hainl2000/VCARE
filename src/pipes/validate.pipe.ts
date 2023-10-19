import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';

@Catch(HttpException)
export class ValidationExceptionFilter implements ExceptionFilter {
  async catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const status = exception.getStatus();
    const err = exception.getResponse();
    const message =
      typeof err['message'] === 'string' ? [err['message']] : err['message'];
    response.status(status).json({
      stastatusCode: status,
      message,
      error: err['error'],
    });
  }
}
