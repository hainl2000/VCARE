import { genSaltSync, compareSync, hashSync } from 'bcrypt';
import * as dayjs from 'dayjs';
import { ISODateRegex, dateRegex } from 'src/constants/regex';
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

export function convertDate(target: any) {
  if (target === null) {
    return null;
  }
  if (
    typeof target === 'string' &&
    (ISODateRegex.test(target) || dateRegex.test(target))
  ) {
    return target.substring(0, 10);
  }
  if (typeof target === 'object') {
    if (Array.isArray(target)) {
      for (let i = 0; i < target.length; i++) {
        target[i] = convertDate(target[i]);
      }
    } else if (typeof target?.getMonth === 'function') {
      target = dayjs(target).format('YYYY-MM-DD');
    } else {
      Object.keys(target).forEach((key) => {
        target[key] = convertDate(target[key]);
      });
    }
    return target;
  }

  return target;
}
