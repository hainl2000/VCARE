import { applyDecorators, UseGuards, SetMetadata } from '@nestjs/common';
import { ROLE_KEY, role } from 'src/constants/type';
import { RoleGuard } from 'src/guards/role.guard';
import { TokenGuard } from 'src/guards/token.guard';

export const Auth = () => {
  return applyDecorators(UseGuards(TokenGuard));
};

export const AuthRole = (...apis: role[]) => {
  return applyDecorators(
    SetMetadata(ROLE_KEY, apis),
    UseGuards(TokenGuard, RoleGuard),
  );
};
