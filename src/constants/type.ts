import { admins, doctors, users } from '@prisma/client';

export const roles = {
  user: 'user',
  admin: 'admin',
  doctor: 'doctor',
} as const;

export const ROLE_KEY = 'ROLE_KEY';

export type role = keyof typeof roles;

export type account = users | admins | doctors;

export type accountWithRole = account & { role: role };
