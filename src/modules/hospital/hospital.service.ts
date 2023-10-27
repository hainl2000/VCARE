import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, admins, doctor_roles } from '@prisma/client';
import {
  CreateHospitalDto,
  GetHospitalDoctors,
  ListHospitalQuery,
} from './hospital.dto';
import { PrismaService } from 'src/shared/prisma.service';
import { generateHashPass, getAccountSafeData } from 'src/utils';

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
    console.log(id, data);

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

  async findAll(query: ListHospitalQuery) {
    const { name, pageIndex, pageSize } = query;
    const index = pageIndex ?? 1;
    const size = pageSize ?? 10;
    const whereOption: Prisma.hospitalsWhereInput = {};
    if (!!name) {
      whereOption.name = { contains: name, mode: 'insensitive' };
    }

    const [data, total] = await Promise.all([
      this.prisma.hospitals.findMany({
        where: whereOption,
        skip: (index - 1) * size,
        take: size,
        orderBy: { id: 'desc' },
      }),
      this.prisma.hospitals.count({ where: whereOption }),
    ]);

    return {
      data: data.map((hospital) => getAccountSafeData(hospital)),
      total,
    };
  }

  async getDetail(id: number) {
    try {
      const result = await this.prisma.hospitals.findUnique({ where: { id } });
      if (!result) {
        throw new NotFoundException('Không tìm thấy bệnh viện này');
      }

      return getAccountSafeData(result);
    } catch (error) {
      throw error;
    }
  }

  async getDoctors(query: GetHospitalDoctors) {
    const { pageSize, pageIndex, hospital_id, name, role_id } = query;
    const index = pageIndex ?? 1;
    const size = pageSize ?? 10;
    const whereOption: Prisma.doctorsWhereInput = { hospital_id };
    if (!!name) {
      whereOption.full_name = { contains: name, mode: 'insensitive' };
    }

    if (!!role_id) {
      whereOption.role_id = role_id;
    }
    try {
      const [data, total] = await Promise.all([
        this.prisma.doctors.findMany({
          where: whereOption,
          skip: (index - 1) * size,
          take: size,
          orderBy: { id: 'desc' },
        }),
        this.prisma.doctors.count({ where: whereOption }),
      ]);

      return {
        data: data.map((d) => getAccountSafeData(d)),
        total,
      };
    } catch (error) {
      throw error;
    }
  }
}
