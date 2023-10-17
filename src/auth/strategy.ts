import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
// import { Strategy } from 'passport-custom';
import { AuthService } from './auth.service';
import { Strategy } from 'passport-local';
import { account, accountWithRole, role } from 'src/constants/type';
// @Injectable()
// export class CustomStrategy extends PassportStrategy(Strategy, 'custom') {
//   constructor(private authService: AuthService) {
//     super(async function (req: Request, callback: any) {
//       const authorization = (req.headers['authorization'] ||
//         req.headers['Authorization']) as string;

//       if (!authorization) {
//         throw new UnauthorizedException('hehe');
//       }
//       const token = authorization.replace('Bearer ', '');
//       const account = await this.authService.validateAccount(token);
//       req['account'] = account;
//       callback(null);
//     });
//   }
// }

@Injectable()
export class TokenStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ passReqToCallback: true });
  }

  async validate(req: Request): Promise<accountWithRole> {
    const authorization = (req.headers['authorization'] ||
      req.headers['Authorization']) as string;

    if (!authorization) {
      throw new UnauthorizedException();
    }
    const token = authorization.replace('Bearer ', '');
    const user = await this.authService.validateAccount(token);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
