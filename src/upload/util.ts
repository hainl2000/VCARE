import { BadRequestException } from '@nestjs/common';
import * as dayjs from 'dayjs';
import { extname } from 'path';
import { ExcelExts, ImageExts, accountWithRole } from 'src/constants/type';

export function genFileName(originalName: string, account: accountWithRole) {
  const ext = extname(originalName);
  if (ImageExts.includes(ext)) {
    return `${account.role}_${account.id}_${dayjs().valueOf()}.png`;
  }

  if (ExcelExts.includes(ext)) {
    return `${account.role}_${account.id}_${dayjs().valueOf()}${ext}`;
  }
  throw new BadRequestException('File không được hỗ trợ');
}
