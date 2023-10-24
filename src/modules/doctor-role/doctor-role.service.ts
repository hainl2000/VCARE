import { Injectable, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/shared/prisma.service';
import { DoctorRoleQuery } from './doctor-role.dto';

@Injectable()
export class DoctorRoleService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(name: string) {
    try {
      return await this.prismaService.doctor_roles.create({
        data: { name },
      });
    } catch (error) {
      throw new BadRequestException('Role đã tồn tại');
    }
  }

  async findAll(query: DoctorRoleQuery) {
    try {
      const whereOption: Prisma.doctor_rolesWhereInput = {};
      const { name, pageIndex, pageSize } = query;
      const size = pageSize ?? 10;
      const index = pageIndex ?? 1;
      if (!!name) {
        whereOption.name = { contains: name, mode: 'insensitive' };
      }
      const [data, total] = await Promise.all([
        this.prismaService.doctor_roles.findMany({
          where: whereOption,
          skip: (index - 1) * size,
          take: size,
        }),
        this.prismaService.doctor_roles.count({ where: whereOption }),
      ]);
      return { data, total };
    } catch (error) {
      throw error;
    }
  }
}
