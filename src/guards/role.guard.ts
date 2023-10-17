import { CanActivate, Injectable, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLE_KEY, accountWithRole, role } from 'src/constants/type';
@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const acceptRoles = this.reflector.get<role[]>(
      ROLE_KEY,
      context.getHandler(),
    );

    if (acceptRoles.length === 0) {
      return true;
    }

    const req = context.switchToHttp().getRequest();

    const account: accountWithRole = req['user'];

    return acceptRoles.includes(account.role);
  }
}
