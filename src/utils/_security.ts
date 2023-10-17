import { genSaltSync, compareSync, hashSync } from 'bcrypt';
const saltRound = 11;
export function generateHashPass(password: string) {
  const salt = genSaltSync(saltRound);
  return hashSync(password, salt);
}

export function comparePassword(password: string, hashPass: string) {
  return compareSync(password, hashPass);
}
