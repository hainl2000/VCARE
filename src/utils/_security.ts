import { genSaltSync, compareSync, hashSync } from 'bcrypt';
import { account, accountField, accountPrivateField } from 'src/constants/type';
const saltRound = 11;
export function generateHashPass(password: string) {
  const salt = genSaltSync(saltRound);
  return hashSync(password, salt);
}

export function comparePassword(password: string, hashPass: string) {
  return compareSync(password, hashPass);
}

export function getAccountSafeData(account: account) {
  Object.keys(account).forEach((key: accountField) => {
    if (accountPrivateField.includes(key)) {
      delete account[key];
    }
    if (
      ['image', 'avatar'].includes(key) &&
      typeof account[key] === 'string' &&
      account[key].length > 0
    ) {
      account[key] = process.env.URL_BUCKET + account[key];
    }
  });

  return account;
}
