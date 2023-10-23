import {
  Injectable,
  OnApplicationBootstrap,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Storage, Bucket } from '@google-cloud/storage';
@Injectable()
export class UploadService implements OnApplicationBootstrap {
  private bucket: Bucket;
  private bucketUrl: string;
  constructor(private readonly configService: ConfigService) {}

  onApplicationBootstrap() {
    this.bucket = new Storage({
      projectId: this.configService.get<string>('bucket.project'),
      keyFilename: 'key/key.json',
    }).bucket(this.configService.get<string>('bucket.name'));

    this.bucketUrl = this.configService.get<string>('bucket.url');
  }

  uploadGoogleStorage(
    file: Express.Multer.File | Buffer,
    fileName: string,
  ): any {
    try {
      const blob = this.bucket.file(fileName);
      const blobStream = blob.createWriteStream();
      blobStream.on('finish', async () => {
        console.log('upload gs success: ', fileName);
      });
      blobStream.on('error', async () => {
        blobStream.end(file.buffer);
        console.log('upload gs Error: ', fileName);
      });
      if (file instanceof Buffer) {
        return blobStream.end(file);
      }
      blobStream.end(file.buffer || file);
    } catch (err) {
      throw new BadRequestException('Không thể tải ảnh lên');
    }
  }

  async upload(file: Express.Multer.File, fileName: string) {
    await this.uploadGoogleStorage(file, fileName);

    return {
      url: this.bucketUrl + fileName,
      fileName,
    };
  }
}
