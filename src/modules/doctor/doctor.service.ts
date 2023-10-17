import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma.service';
import { CreateDoctorDto } from './doctor.dto';
import { generateHashPass } from 'src/utils/_security';
import { Prisma } from '@prisma/client';

@Injectable()
export class DoctorService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateDoctorDto) {
    try {
      const { email, phone } = data;
      const existed = await this.prisma.doctors.findFirst({
        where: { OR: [{ email }, { phone }] },
      });

      if (!!existed) {
        throw new BadRequestException('Email/SĐT đã tồn tại trên hệ thống');
      }

      data.password = generateHashPass(data.password);

      return await this.prisma.doctors.create({ data });
    } catch (error) {
      throw error;
    }
  }

  async findDoctorByUserName(username: string) {
    try {
      const doctor = await this.prisma.doctors.findFirst({
        where: { OR: [{ phone: username }, { email: username }] },
        include: { hospital: true },
      });

      if (!doctor) {
        throw new NotFoundException('Không tồn tại tài khoản này');
      }

      return doctor;
    } catch (error) {
      throw error;
    }
  }

  async update(
    id: number,
    data: Prisma.XOR<
      Prisma.doctorsUpdateInput,
      Prisma.doctorsUncheckedUpdateInput
    >,
  ) {
    try {
      return await this.prisma.doctors.update({
        where: { id },
        data,
      });
    } catch (error) {
      throw error;
    }
  }

  async findById(id: number) {
    try {
      return await this.prisma.doctors.findUnique({ where: { id } });
    } catch (error) {
      throw error;
    }
  }
}
