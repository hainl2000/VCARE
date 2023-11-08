import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { convertDate, convertImage } from 'src/utils';

export class ConvertDateInterceptors implements NestInterceptor {
  intercept(context: ExecutionContext, handler: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest<Request>();
    if (req.headers['web'] === 'true') {
      return handler.handle().pipe(map((data) => convertImage(data)));
    }
    return handler
      .handle()
      .pipe(map((data) => convertImage(convertDate(data))));
  }
}
