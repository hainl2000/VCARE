import { Prisma } from '@prisma/client';
import { randomInt } from 'crypto';
import * as dayjs from 'dayjs';

export function generateOtp() {
  const value = randomInt(0, 1000000);
  const buffer = '000000' + value;
  return buffer.substring(buffer.length - 6);
}

export function dateFilter(
  startFrom?: string,
  endAt?: string,
): Prisma.DateTimeFilter {
  const filter: Prisma.DateTimeFilter = {};
  const startTime =
    !!startFrom && dayjs(startFrom).isValid() ? startFrom : null;
  const endTime = !!endAt && dayjs(endAt).isValid() ? endAt : null;
  if (!!startTime && !!endTime) {
    filter.gte = dayjs(startTime).startOf('date').toDate();
    filter.lt = dayjs(endTime).startOf('date').add(1, 'day').toDate();
  } else if (!!startTime) {
    filter.gte = dayjs(startTime).startOf('date').toDate();
  } else if (!!endTime) {
    filter.lt = dayjs(endTime).startOf('date').add(1, 'day').toDate();
  }

  return filter;
}
