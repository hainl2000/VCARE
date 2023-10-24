import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma.service';
import { CreateDoctorDto } from './doctor.dto';
import { generateHashPass } from 'src/utils/_security';
import { Prisma, hospitals } from '@prisma/client';
import { accountWithRole } from 'src/constants/type';

@Injectable()
export class DoctorService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateDoctorDto, hospital: hospitals) {
    try {
      const { email, phone } = data;
      const existed = await this.prisma.doctors.findFirst({
        where: { OR: [{ email }, { phone }] },
      });

      if (!!existed) {
        throw new BadRequestException('Email/SĐT đã tồn tại trên hệ thống');
      }

      data.password = generateHashPass(data.password);
      data.hospital_id = hospital.id;

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
    hospital?: hospitals,
  ) {
    try {
      if (!!hospital) {
        const doctor = await this.findById(id);
        if (!doctor || doctor.hospital_id !== hospital.id) {
          throw new BadRequestException('Bác sĩ không hợp lệ');
        }
      }
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
