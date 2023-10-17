import {
  ExecutionContext,
  UnauthorizedException,
  createParamDecorator,
} from '@nestjs/common';
import * as JWT from 'jsonwebtoken';
export const Account = createParamDecorator(
  (data: string | undefined, context: ExecutionContext) => {
    try {
      const req = context.switchToHttp().getRequest<Request>();
      let account = req['user'];
      if (!!account) {
        return !!data ? account[data] : account;
      } else {
        const token = (req.headers['authorization'] ||
          req.headers['authorization']) as string;
        if (!token) {
          throw new UnauthorizedException();
        }
        account = JWT.decode(token.replace('Bearer ', ''));
        if (!account) {
          throw new UnauthorizedException();
        }

        return account;
      }
    } catch (error) {
      throw new UnauthorizedException();
    }
  },
);
