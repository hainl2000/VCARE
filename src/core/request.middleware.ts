import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import * as dayjs from 'dayjs';
import { NextFunction, Request, Response } from 'express';
import * as JWT from 'jsonwebtoken';
import { account, accountWithRole, role } from 'src/constants/type';
import { PrismaService } from 'src/shared/prisma.service';

@Injectable()
export class RequestMiddleware implements NestMiddleware {
  private readonly logger = new Logger(RequestMiddleware.name);
  constructor(private readonly prismaService: PrismaService) {}
  async use(req: Request, res: Response, next: NextFunction) {
    const startTime = dayjs().valueOf();
    const authorization = (req.headers['authorization'] ||
      req.headers['Authorization']) as string;
    let account: accountWithRole = null;
    if (!!authorization && authorization.includes('Bearer ')) {
      const token = authorization.replace('Bearer ', '');
      try {
        const payload = JWT.decode(token) as {
          id: number;
          role: role;
        };
        const { role, id } = payload;
        let target: account;
        switch (role) {
          case 'user':
            target = await this.prismaService.users.findUnique({
              where: { id },
            });
            break;
          case 'doctor':
            target = await this.prismaService.doctors.findUnique({
              where: { id },
            });
            break;
          case 'admin':
            target = await this.prismaService.admins.findUnique({
              where: { id },
            });
            break;
          case 'hospital':
            target = await this.prismaService.hospitals.findUnique({
              where: { id },
            });
            break;
          default:
            target = await this.prismaService.users.findUnique({
              where: { id },
            });
            break;
        }

        if (!!target) {
          const { security_key } = target;

          JWT.verify(token, security_key, {
            algorithms: ['RS256'],
          });

          account = { ...target, role };
        }
      } catch (error) {}
    }
    req['account'] = account;

    next();

    res.on('close', () => {
      const { ip, method, path: url } = req;
      const userAgent = req.get('user-agent') || '';
      const status = res.statusCode;
      const contentLength = res.get('content-length');
      const log = `Request: ${userAgent}, ip ${ip}. Target: ${url}, method ${method}. Response: status ${status}, size ${contentLength}. Total ${
        dayjs().valueOf() - startTime
      }ms.`;
      this.logger.debug(log);
    });
  }
}
