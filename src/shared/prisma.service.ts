import {
  Injectable,
  OnApplicationBootstrap,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { DRole } from 'src/data/doctor-role';
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
    await this.doctor_roles.createMany({
      data: DRole.map((item) => ({ name: item })),
      skipDuplicates: true,
    });
  }
}
