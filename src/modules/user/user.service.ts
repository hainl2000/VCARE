import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma.service';
import { CreateUserDto } from './user.dto';
import { generateHashPass } from 'src/utils/_security';
import { Prisma } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateUserDto) {
    try {
      const { email, phone } = data;
      const existed = await this.prisma.users.findFirst({
        where: { OR: [{ email }, { phone }] },
      });

      if (!!existed) {
        throw new BadRequestException('Email/SĐT đã tồn tại trên hệ thống');
      }

      data.password = generateHashPass(data.password);

      return await this.prisma.users.create({ data });
    } catch (error) {
      throw error;
    }
  }

  async findUserByUserName(username: string) {
    try {
      const user = await this.prisma.users.findFirst({
        where: { OR: [{ phone: username }, { email: username }] },
      });

      if (!user) {
        throw new NotFoundException('Không tồn tại tài khoản này');
      }

      return user;
    } catch (error) {
      throw error;
    }
  }

  async update(
    id: number,
    data: Prisma.XOR<Prisma.usersUpdateInput, Prisma.usersUncheckedUpdateInput>,
  ) {
    try {
      return await this.prisma.users.update({
        where: { id },
        data,
      });
    } catch (error) {
      throw error;
    }
  }

  async findById(id: number) {
    try {
      return await this.prisma.users.findUnique({ where: { id } });
    } catch (error) {
      throw error;
    }
  }
}
