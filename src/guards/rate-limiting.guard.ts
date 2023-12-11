import { ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { ThrottlerLimitDetail } from '@nestjs/throttler/dist/throttler.guard.interface';

export class RateLimitingGuard extends ThrottlerGuard {
  protected async throwThrottlingException(
    context: ExecutionContext,
    throttlerLimitDetail: ThrottlerLimitDetail,
  ) {
    throw new HttpException(
      {
        message: 'Yêu cầu quá nhanh',
        error: 'TOO_MANY_REQUEST',
      },
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }
}
