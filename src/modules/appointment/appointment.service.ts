import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma.service';
import { CreateAppointmentDto, ListAppointmentQuery } from './appointment.dto';
import { Prisma, doctors, users } from '@prisma/client';
import * as dayjs from 'dayjs';
import { account, accountWithRole, userField } from 'src/constants/type';
import { UserService } from '../user/user.service';
import { dateFilter } from 'src/utils';

@Injectable()
export class AppointmentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
  ) {}

  async create(data: CreateAppointmentDto, user: users) {
    const {
      department_id,
      hospital_id,
      medical_condition,
      time_in_string,
      ...checkData
    } = data;

    const existed = await this.prisma.health_check_appointment.findFirst({
      where: { user_id: user.id, time_in_string },
      orderBy: { id: 'desc' },
    });

    if (!!existed) {
      throw new BadRequestException('Bạn đã đặt lịch ở thời điểm này rồi');
    }

    const updateUserData: Prisma.usersUpdateInput = {};

    Object.keys(checkData).forEach((key: userField) => {
      if (!user[key] || user[key] !== checkData[key]) {
        updateUserData[key] = checkData[key];
      }
    });

    if (Object.keys(updateUserData).length > 0) {
      await this.userService.update(user, updateUserData);
    }

    return await this.prisma.health_check_appointment.create({
      data: {
        medical_condition,
        time_in_string,
        time: dayjs(time_in_string).toDate(),
        department_id,
        hospital_id,
        user_id: user.id,
      },
    });
  }

  async checkTime(time: string, user: users) {
    const [conflict, nearby] = await Promise.all([
      this.prisma.health_check_appointment.findFirst({
        where: { user_id: user.id, time_in_string: time },
      }),
      this.prisma.health_check_appointment.findFirst({
        where: { user_id: user.id, finished: false },
        orderBy: { id: 'desc' },
      }),
    ]);

    if (!!conflict) {
      throw new BadRequestException('Thời điểm đã được đặt');
    }

    if (!!nearby && dayjs().isBefore(nearby.time)) {
      return {
        status: true,
        message: 'Đã đặt khung giờ khác. Có thể đặt thêm',
      };
    }

    return {
      status: true,
      message: 'Có thể đặt',
    };
  }

  async findAll(query: ListAppointmentQuery, account: accountWithRole) {
    const { endAt, external_code, name, pageIndex, pageSize, startFrom } =
      query;

    const size = pageSize ?? 10;
    const index = pageIndex ?? 1;

    const whereOption: Prisma.health_check_appointmentWhereInput = {};

    switch (account.role) {
      case 'user':
        whereOption.user_id = account.id;
        break;
      case 'doctor':
        whereOption.OR = [
          { department_id: account['department_id'], finished: false },
          { doctor_id: account.id, finished: true },
        ];
        break;
      default:
        break;
    }

    whereOption.time = dateFilter(startFrom, endAt);

    if (!!external_code) {
      whereOption.external_code = { contains: external_code };
    }

    if (!!name) {
      whereOption.user = { full_name: { contains: name, mode: 'insensitive' } };
    }

    const [data, total] = await Promise.all([
      this.prisma.health_check_appointment.findMany({
        where: whereOption,
        skip: (index - 1) * size,
        take: size,
        orderBy: { id: 'desc' },
      }),
      this.prisma.health_check_appointment.count({ where: whereOption }),
    ]);

    return {
      data,
      total,
    };
  }

  async getDetail(data: string) {
    const whereOption: Prisma.health_check_appointmentWhereInput = {
      OR: [
        { external_code: data },
        { user: { identity_number: data } },
        { user: { social_insurance_number: data } },
      ],
    };

    if (Number.isInteger(+data)) {
      whereOption.OR = [...whereOption.OR, { id: +data }];
    }

    const result = await this.prisma.health_check_appointment.findMany({
      where: whereOption,
      orderBy: { id: 'desc' },
    });

    return result[0];
  }

  async update(
    id: number,
    data: Prisma.XOR<
      Prisma.health_check_appointmentUpdateInput,
      Prisma.health_check_appointmentUncheckedUpdateInput
    >,
    doctor: doctors,
  ) {
    try {
      data.doctor_id = doctor.id;
      return await this.prisma.health_check_appointment.update({
        where: { id },
        data: data,
      });
    } catch (error) {
      throw error;
    }
  }
}
