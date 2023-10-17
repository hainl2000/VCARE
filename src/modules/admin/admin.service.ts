import { Prisma, admins } from '@prisma/client';
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { CreateAdminDto } from './admin.dto';
import { PrismaService } from 'src/shared/prisma.service';
import { generateHashPass } from 'src/utils/_security';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateAdminDto) {
    try {
      const { email } = data;
      const existed = await this.prisma.admins.findUnique({
        where: { email },
      });

      if (!!existed) {
        throw new BadRequestException('Email/SĐT đã tồn tại trên hệ thống');
      }

      data.password = generateHashPass(data.password);

      return await this.prisma.admins.create({ data });
    } catch (error) {
      throw error;
    }
  }

  async findAdminByEmail(email: string) {
    try {
      const admin = await this.prisma.admins.findUnique({
        where: { email },
      });

      if (!admin) {
        throw new NotFoundException('Không tồn tại tài khoản này');
      }

      return admin;
    } catch (error) {
      throw error;
    }
  }

  async update(
    id: number,
    data: Prisma.XOR<
      Prisma.adminsUpdateInput,
      Prisma.adminsUncheckedUpdateInput
    >,
  ) {
    try {
      return await this.prisma.admins.update({
        where: { id },
        data,
      });
    } catch (error) {
      throw error;
    }
  }

  async findById(id: number) {
    try {
      return await this.prisma.admins.findUnique({ where: { id } });
    } catch (error) {
      throw error;
    }
  }
}
