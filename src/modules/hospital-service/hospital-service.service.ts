import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, hospitals } from '@prisma/client';
import { PrismaService } from 'src/shared/prisma.service';
import {
  CreateHospitalServiceDto,
  HospitalServiceQuery,
  UpdateHospitalServiceDto,
} from './hospital-service.dto';
import { accountWithRole } from 'src/constants/type';

@Injectable()
export class HospitalServiceService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(data: CreateHospitalServiceDto, hospital: hospitals) {
    try {
      return await this.prismaService.hospital_services.create({
        data: {
          ...data,
          hospital_id: hospital.id,
        },
      });
    } catch (error) {
      throw new BadRequestException('Service đã tồn tại');
    }
  }

  async findById(id: number) {
    return await this.prismaService.hospital_services.findUnique({
      where: { id },
    });
  }

  async update(
    id: number,
    data: UpdateHospitalServiceDto,
    hospital: hospitals,
  ) {
    try {
      const service = await this.findById(id);

      if (!service) {
        throw new NotFoundException('Không tìm thấy dịch vụ');
      }

      if (service.hospital_id !== hospital.id) {
        throw new BadRequestException('Dịch vụ không hợp lệ');
      }

      await this.prismaService.hospital_services.update({
        where: { id },
        data: {
          ...data,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async findAll(query: HospitalServiceQuery, account: accountWithRole) {
    try {
      const { name, pageIndex, pageSize, hospital_id } = query;
      if (
        (account.role === 'user' || account.role === 'admin') &&
        !hospital_id
      ) {
        throw new BadRequestException('Thiếu thông tin bệnh viện');
      }

      const whereOption: Prisma.hospital_servicesWhereInput = { hospital_id };
      const size = pageSize ?? 10;
      const index = pageIndex ?? 1;
      if (!!name) {
        whereOption.name = { contains: name, mode: 'insensitive' };
      }
      const [data, total] = await Promise.all([
        this.prismaService.hospital_services.findMany({
          where: whereOption,
          skip: (index - 1) * size,
          take: size,
        }),
        this.prismaService.hospital_services.count({ where: whereOption }),
      ]);
      return { data, total };
    } catch (error) {
      throw error;
    }
  }
}
