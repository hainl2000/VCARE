import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma.service';
import {
  CreateDepartmentDto,
  ListDepartmentQuery,
  UpdateDepartmentDto,
} from './department.dto';
import { accountWithRole } from 'src/constants/type';
import { Prisma, hospitals } from '@prisma/client';
import { getAccountSafeData } from 'src/utils';

@Injectable()
export class DepartmentService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateDepartmentDto, hospital: hospitals) {
    try {
      return await this.prisma.hospital_department.create({
        data: {
          name: data.name,
          hospital_id: hospital.id,
          time_per_turn: data.time_per_turn ?? 5,
        },
      });
    } catch (error) {
      throw new BadRequestException('Bệnh viện đã có khoa này');
    }
  }

  async findAll(query: ListDepartmentQuery, account: accountWithRole) {
    const { name, pageIndex, pageSize, hospital_id } = query;

    const index = pageIndex ?? 1;
    const size = pageSize ?? 10;
    const whereOption: Prisma.hospital_departmentWhereInput = {};

    if (account.role === 'hospital') {
      whereOption.hospital_id = account.id;
    }

    if (!!hospital_id && !whereOption.hospital_id) {
      whereOption.hospital_id = hospital_id;
    }

    if (!!name) {
      whereOption.name = { contains: name, mode: 'insensitive' };
    }

    const [data, total] = await Promise.all([
      this.prisma.hospital_department.findMany({
        where: whereOption,
        skip: (index - 1) * size,
        take: size,
        orderBy: { id: 'desc' },
      }),
      this.prisma.hospital_department.count({ where: whereOption }),
    ]);

    return {
      data,
      total,
    };
  }

  async getDetail(id: number) {
    try {
      const result = await this.prisma.hospital_department.findUnique({
        where: { id },
      });
      if (!result) {
        throw new NotFoundException('Không tìm thấy khoa này này');
      }

      return result;
    } catch (error) {
      throw error;
    }
  }

  async update(id: number, data: UpdateDepartmentDto, hospitalId: number) {
    try {
      return await this.prisma.hospital_department.updateMany({
        where: { id, hospital_id: hospitalId },
        data,
      });
    } catch (error) {
      throw new BadRequestException('Không có quyền chỉnh sửa');
    }
  }
}
