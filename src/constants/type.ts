import { admins, doctors, users, Prisma, hospitals } from '@prisma/client';

export const roles = {
  user: 'user',
  admin: 'admin',
  doctor: 'doctor',
  hospital: 'hospital',
} as const;

export const ROLE_KEY = 'ROLE_KEY';

export enum ENV {
  local = 'local',
  dev = 'dev',
}

export type role = keyof typeof roles;

export type account = users | admins | doctors | hospitals;

export type accountWithRole = account & { role: role };

export type userField = keyof users;

export const checkFieldUpdateUser: userField[] = [
  'phone',
  'email',
  'password',
  'full_name',
  'gender',
  'avatar',
  'dob',
  'address',
  'identity_number',
  'social_insurance_number',
];

export const privateField: userField[] = [
  'password',
  'security_key',
  'external_code',
  'otp_data',
  'change_history',
];
