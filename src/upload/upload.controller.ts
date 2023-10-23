import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { UploadService } from './upload.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { extname } from 'path';
import { AuthRole } from 'src/decorators/authorization.decorator';
import { Account } from 'src/decorators/account.decorator';
import { accountWithRole } from 'src/constants/type';
import * as dayjs from 'dayjs';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @AuthRole()
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fieldNameSize: 255,
        fileSize: 50e6,
        files: 1,
        fields: 1,
      },
    }),
  )
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Account() account: accountWithRole,
  ) {
    const ext = extname(file.originalname);

    if (ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg' && ext !== '.gif') {
      throw new BadRequestException('Chỉ upload được ảnh');
    }
    try {
      const fileName = `${account.role}_${account.id}_${dayjs().valueOf()}.png`;
      return await this.uploadService.upload(file, fileName);
    } catch (error) {
      throw error;
    }
  }
}
