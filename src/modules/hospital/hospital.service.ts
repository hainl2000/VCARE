import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, admins } from '@prisma/client';
import { CreateHospitalDto } from './hospital.dto';
import { PrismaService } from 'src/shared/prisma.service';
import { generateHashPass } from 'src/utils';

@Injectable()
export class HospitalService {
  constructor(private readonly prisma: PrismaService) {}
  async create(admin: admins, data: CreateHospitalDto) {
    try {
      const { email, phone, name } = data;
      const existed = await this.prisma.hospitals.findFirst({
        where: {
          OR: [{ email }, { phone }, { name }],
        },
      });

      if (!!existed) {
        throw new BadRequestException(
          'Email/SĐT/Tên bệnh viện đã tồn tại trên hệ thống',
        );
      }

      data.password = generateHashPass(data.password);
      const createData: Prisma.XOR<
        Prisma.hospitalsCreateInput,
        Prisma.hospitalsUncheckedCreateInput
      > = { ...data, created_by_id: admin.id };
      return await this.prisma.hospitals.create({ data: createData });
    } catch (error) {
      throw error;
    }
  }

  async findHospitalByUsername(username: string) {
    try {
      const hospital = await this.prisma.hospitals.findFirst({
        where: {
          OR: [{ email: username }, { phone: username }],
        },
      });

      if (!hospital) {
        throw new NotFoundException('Không tồn tại tài khoản này');
      }

      return hospital;
    } catch (error) {
      throw error;
    }
  }

  async update(
    id: number,
    data: Prisma.XOR<
      Prisma.hospitalsUpdateInput,
      Prisma.hospitalsUncheckedUpdateInput
    >,
  ) {
    try {
      return await this.prisma.hospitals.update({
        where: { id },
        data,
      });
    } catch (error) {
      throw error;
    }
  }

  async findById(id: number) {
    try {
      return await this.prisma.hospitals.findUnique({ where: { id } });
    } catch (error) {
      throw error;
    }
  }
}
