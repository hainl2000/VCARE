import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma.service';
import {
  CreateAppointmentDto,
  GetAppointmentDetailQuery,
  ListAppointmentQuery,
  PatientHistoryQuery,
  SearchAppointDto,
  UpdateServiceResultDto,
} from './appointment.dto';
import {
  Prisma,
  doctor_roles,
  doctors,
  hospital_services,
  medical_services,
  users,
} from '@prisma/client';
import * as dayjs from 'dayjs';
import { account, accountWithRole, role, userField } from 'src/constants/type';
import { UserService } from '../user/user.service';
import { dateFilter, getAccountSafeData } from 'src/utils';

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
    const patient_information = {
      full_name: user.full_name,
      identity_number: user.identity_number,
      social_insurance_number: user.social_insurance_number,
      phone: user.phone,
      email: user.email,
    };

    if (Object.keys(updateUserData).length > 0) {
      const update = await this.userService.update(user, updateUserData);
      patient_information.identity_number = update['identity_number'];
      patient_information.social_insurance_number =
        update['social_insurance_number'];
      patient_information.full_name = update['full_name'];
    }

    return await this.prisma.health_check_appointment.create({
      data: {
        medical_condition,
        time_in_string,
        time: dayjs(time_in_string).toDate(),
        department_id,
        hospital_id,
        user_id: user.id,
        patient_information,
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
    const { endAt, search_value, pageIndex, pageSize, startFrom } = query;

    const size = pageSize ?? 10;
    const index = pageIndex ?? 1;

    const whereOption: Prisma.health_check_appointmentWhereInput = {};

    switch (account.role) {
      case 'user':
        whereOption.user_id = account.id;
        break;
      case 'doctor':
        const { drole } = account as doctors & {
          drole: doctor_roles;
          role: role;
        };
        if (drole.name === 'specialis') {
          whereOption.OR = [
            { department_id: account['department_id'], finished: false },
            { doctor_id: account.id, finished: true },
          ];
        }
        break;
      default:
        break;
    }

    whereOption.time = dateFilter(startFrom, endAt);

    if (!!search_value) {
      whereOption.OR = [
        { external_code: { contains: search_value } },
        { user: { phone: search_value } },
        { user: { email: search_value } },
        { user: { identity_number: search_value } },
        { user: { social_insurance_number: search_value } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.health_check_appointment.findMany({
        where: whereOption,
        skip: (index - 1) * size,
        include: {
          hospital: { select: { name: true, image: true, information: true } },
          department: { select: { name: true } },
        },
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

  async getAppointmentService(query: ListAppointmentQuery, doctor: doctors) {
    const { endAt, search_value, pageIndex, pageSize, startFrom } = query;

    const size = pageSize ?? 10;
    const index = pageIndex ?? 1;

    const whereOption: Prisma.use_serviceWhereInput = {
      service_id: doctor.service_id,
    };

    whereOption.appointment.time = dateFilter(startFrom, endAt);

    if (!!search_value) {
      whereOption.OR = [
        { appointment: { external_code: { contains: search_value } } },
        { appointment: { user: { phone: search_value } } },
        { appointment: { user: { email: search_value } } },
        { appointment: { user: { identity_number: search_value } } },
        { appointment: { user: { social_insurance_number: search_value } } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.use_service.findMany({
        where: whereOption,
        skip: (index - 1) * size,
        take: size,
      }),
      this.prisma.use_service.count({ where: whereOption }),
    ]);

    return {
      data,
      total,
    };
  }

  async findById(id: number) {
    return await this.prisma.health_check_appointment.findUnique({
      where: { id },
      include: {
        services: { include: { service: true } },
        hospital: {
          include: {
            hospital_department: true,
          },
        },
        department: {
          select: {
            name: true,
          },
        },
        doctor: true,
      },
    });
  }

  async getDetail(appointmentId: number, account: accountWithRole) {
    const appointment = await this.prisma.health_check_appointment.findUnique({
      where: { id: appointmentId },
      include: {
        services: { include: { doctor: true, service: true } },
        doctor: true,
      },
    });

    if (!appointment) {
      throw new NotFoundException('Không tìm thấy lịch khám');
    }
    if (account.role === 'user' && appointment.user_id !== account.id) {
      throw new NotFoundException('Không thể truy cập tài nguyên');
    }

    if (account.role === 'hospital' && appointment.hospital_id !== account.id) {
      throw new NotFoundException('Không thể truy cập tài nguyên');
    }

    if (
      account.role === 'doctor' &&
      appointment.hospital_id !== account['hospital_id']
    ) {
      throw new NotFoundException('Không thể truy cập tài nguyên');
    }

    return {
      ...appointment,
      services_result: appointment.services.flatMap((item) => {
        return item.result_image.map((img) => ({
          label: 'Kết quả ' + item.service.name,
          url: img,
        }));
      }),
    };
  }

  async addServices(id: number, services: number[]) {
    try {
      const records = await this.prisma.medical_services.findMany({
        where: { id: { in: services } },
      });

      const appointment = await this.prisma.health_check_appointment.findUnique(
        {
          where: { id },
        },
      );
      if (records.length === 0) {
        throw new BadRequestException('Dịch vụ không hợp lệ');
      }
      if (!appointment) {
        throw new NotFoundException('Không tìm thấy lịch khám');
      }

      const fee = records.reduce((pre: number, cur: medical_services) => {
        return pre + (cur.fee ?? 0);
      }, 0);

      await this.prisma.use_service.createMany({
        data: records.map((r) => ({
          appointment_id: id,
          service_id: r.id,
        })),
      });

      return fee;
    } catch (error) {
      throw error;
    }
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

  async updateServiceResult(data: UpdateServiceResultDto, doctor: doctors) {
    try {
      const { appointment_id, service_id, result_image } = data;
      const service = await this.prisma.medical_services.findUnique({
        where: { id: service_id },
      });
      if (doctor.service_id !== service.service_id) {
        throw new BadRequestException('Dịch vụ không hỗ trợ');
      }
      return await this.prisma.use_service.update({
        where: {
          appointment_id_service_id: {
            appointment_id,
            service_id,
          },
        },
        data: {
          result_image,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async getPatientHistory(
    query: PatientHistoryQuery,
    account: accountWithRole,
  ) {
    const { patientId, pageIndex, pageSize } = query;
    const whereOption: Prisma.health_check_appointmentWhereInput = {
      finished: true,
    };

    if (account.role === 'doctor') {
      whereOption.department_id = account['department_id'];
    }

    if (account.role === 'hospital') {
      whereOption.hospital_id = account['id'];
    }

    if (account.role === 'user') {
      whereOption.user_id = account.id;
    }

    if (!!patientId && !whereOption.user_id) {
      whereOption.user_id = patientId;
      whereOption.finished = undefined;
    }
    const index = pageIndex ?? 1;
    const size = pageSize || 10;
    const [data, total] = await Promise.all([
      this.prisma.health_check_appointment.findMany({
        where: whereOption,
        orderBy: { id: 'desc' },
        include: { doctor: true, services: true },
        skip: (index - 1) * size,
        take: size,
      }),
      this.prisma.health_check_appointment.count({ where: whereOption }),
    ]);

    return {
      total,
      data: data.map((item) => ({
        id: item.id,
        doctor: getAccountSafeData(item.doctor),
        patient_information: item.patient_information,
        medical_condition: item.medical_condition,
        conclude: item.conclude,
        note: item.note,
        medicine: item.medicine,
        fee: item.fee,
      })),
    };
  }

  async searchAppointment(query: SearchAppointDto, doctor: doctors) {
    try {
      const { search_value } = query;
      const whereOption: Prisma.health_check_appointmentWhereInput = {
        services: { some: { service: { service_id: doctor.service_id } } },
      };
      if (!!search_value) {
        whereOption.OR = [
          { external_code: { contains: search_value } },
          { user: { phone: search_value } },
          { user: { email: search_value } },
          { user: { identity_number: search_value } },
          { user: { social_insurance_number: search_value } },
        ];
      }
      const result = await this.prisma.health_check_appointment.findFirst({
        where: whereOption,
        include: {
          services: {
            include: {
              service: true,
            },
          },
        },
      });
      if (!!result) {
        return {
          ...result,
          services_result: result.services.flatMap((item) => {
            return item.result_image.map((img) => ({
              label: item.service.name,
              url: img,
            }));
          }),
        };
      }
      return null;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
