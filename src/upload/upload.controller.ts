import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  UploadedFiles,
} from '@nestjs/common';
import { UploadService } from './upload.service';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
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

  @AuthRole()
  @Post('multi')
  @UseInterceptors(FilesInterceptor('files', 4))
  async uploadMulti(
    @UploadedFiles() files: Express.Multer.File[],
    @Account() account: accountWithRole,
  ) {
    const valid = files.every((file) => {
      const ext = extname(file.originalname);
      if (
        ext !== '.png' &&
        ext !== '.jpg' &&
        ext !== '.jpeg' &&
        ext !== '.gif'
      ) {
        return false;
      }
      return true;
    });

    if (!valid) {
      throw new BadRequestException('Chỉ upload được ảnh');
    }
    try {
      const currentTime = dayjs().valueOf();
      const fileNames = files.map(
        (_, index) =>
          `${account.role}_${account.id}_${currentTime}_${index}.png`,
      );

      return await Promise.all(
        files.map((file, index) =>
          this.uploadService.upload(file, fileNames[index]),
        ),
      );
    } catch (error) {
      throw error;
    }
  }
}
