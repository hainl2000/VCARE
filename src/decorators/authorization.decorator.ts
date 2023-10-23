import { SetMetadata, UseGuards, applyDecorators } from '@nestjs/common';
import { ROLE_KEY, role } from 'src/constants/type';
import { RoleGuard } from 'src/guards/role.guard';

export const AuthRole = (...apis: role[]) => {
  return applyDecorators(SetMetadata(ROLE_KEY, apis), UseGuards(RoleGuard));
};
