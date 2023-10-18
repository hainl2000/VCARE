import {
  Injectable,
  OnApplicationBootstrap,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { generateHashPass } from 'src/utils/_security';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnApplicationBootstrap
{
  async onModuleInit() {
    await this.$connect();
  }

  async onApplicationBootstrap() {
    await this.admins.createMany({
      data: {
        email: 'Vucarekhcn@gmail.com',
        password: generateHashPass('vucare123'),
      },
      skipDuplicates: true,
    });
  }
}
