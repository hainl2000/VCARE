import {
  ExecutionContext,
  UnauthorizedException,
  createParamDecorator,
} from '@nestjs/common';
export const Account = createParamDecorator(
  (data: string | undefined, context: ExecutionContext) => {
    try {
      const req = context.switchToHttp().getRequest<Request>();
      const account = req['account'];
      if (!!account) {
        return !!data ? account[data] : account;
      }
    } catch (error) {
      throw new UnauthorizedException();
    }
  },
);
