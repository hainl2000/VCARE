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
import { genFileName } from './util';

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
    try {
      const fileName = genFileName(file.originalname, account);
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
    const fileNames = files.map((item) =>
      genFileName(item.originalname, account),
    );
    try {
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
