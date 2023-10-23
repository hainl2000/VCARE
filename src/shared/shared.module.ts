/* eslint-disable prettier/prettier */
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { ConfigService } from '@nestjs/config';
import { SendMailService } from './mailer.service';

@Global()
@Module({
  providers: [PrismaService, ConfigService, SendMailService],
  exports: [PrismaService, ConfigService, SendMailService],
})
export class SharedModule {}
