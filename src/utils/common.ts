import { randomInt } from 'crypto';

export function generateOtp() {
  const value = randomInt(0, 1000000);
  const buffer = '000000' + value;
  return buffer.substring(buffer.length - 6);
}
