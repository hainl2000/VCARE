import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { convertDate } from 'src/utils';

export class ConvertDateInterceptors implements NestInterceptor {
  intercept(context: ExecutionContext, handler: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest<Request>();
    if (req.headers['web'] === 'true') {
      return handler.handle();
    }
    return handler.handle().pipe(map((data) => convertDate(data)));
  }
}
