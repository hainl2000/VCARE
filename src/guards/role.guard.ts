import {
  CanActivate,
  Injectable,
  ExecutionContext,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { doctor_roles, doctors } from '@prisma/client';
import { DROLE_KEY, ROLE_KEY, accountWithRole, role } from 'src/constants/type';
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

    const account: accountWithRole = req['account'];

    if (!account) {
      throw new UnauthorizedException();
    }
    const canAccess = acceptRoles.includes(account.role);

    if (canAccess && account.role !== 'doctor') {
      return true;
    }

    const requireDoctorRoles = this.reflector.get<string[]>(
      DROLE_KEY,
      context.getHandler(),
    );

    if (requireDoctorRoles.length === 0) return true;
    const doctor = account as doctors & {
      drole: doctor_roles | null;
      role: role;
    };

    if (!doctor.drole) {
      return false;
    }

    switch (doctor.drole.name) {
      case 'service':
        if (!doctor.service_id) {
          throw new BadRequestException('Chức năng yêu cầu bác sĩ có dịch vụ');
        }
        break;
      case 'specialis':
        if (!doctor.department_id) {
          throw new BadRequestException('Chức năng yêu cầu bác sĩ có khoa');
        }
        break;
      default:
        break;
    }

    return requireDoctorRoles.includes(doctor.drole.name);
  }
}
