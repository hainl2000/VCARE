import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  Prisma,
  doctor_roles,
  doctors,
  health_check_appointment,
  hospital_department,
  medical_services,
  users,
} from '@prisma/client';
import * as dayjs from 'dayjs';
import {
  accountWithRole,
  doctorRole,
  role,
  userField,
} from 'src/constants/type';
import { PrismaService } from 'src/shared/prisma.service';
import { dateFilterString, getAccountSafeData } from 'src/utils';
import { UserService } from '../user/user.service';
import {
  CreateAppointmentDto,
  ListAppointmentQuery,
  PatientHistoryQuery,
  SearchAppointDto,
  UpdateServiceResultDto,
} from './appointment.dto';
import { getAppointmentStatus } from './util';

@Injectable()
export class AppointmentService {
  private availableCodes: string[] = [];
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
      hour,
      ...checkData
    } = data;

    if (!dayjs(time_in_string).isAfter(dayjs().startOf('date'))) {
      throw new BadRequestException('Thời điểm đặt lịch phải sau ngày hôm nay');
    }

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

    const department = await this.prisma.hospital_department.findUnique({
      where: { id: department_id },
    });

    const check = await this.prisma.health_check_appointment.findMany({
      where: { department_id, time_in_string },
      select: { order: true },
    });

    const orders = check.map((c) => c.order);

    let order: number = null;

    const maxOrder = Math.floor((10 * 60) / department.time_per_turn);

    if (!!hour) {
      const startHour = (hour - 7) * 60;
      const startRange =
        startHour % department.time_per_turn
          ? startHour +
            department.time_per_turn -
            (startHour % department.time_per_turn)
          : startHour;
      const endHour = (hour - 6) * 60;
      const endRange =
        endHour % department.time_per_turn
          ? endHour +
            department.time_per_turn -
            (endHour % department.time_per_turn)
          : endHour;
      const rangeStart = startRange / department.time_per_turn + 1;
      const rangeEnd = endRange / department.time_per_turn + 1;
      const rangeLength = rangeEnd - rangeStart;
      const range = Array.from(
        { length: rangeLength },
        (_, i) => rangeStart + i,
      );

      order = range.find((r) => !orders.includes(r));
      if (order === undefined) {
        throw new BadRequestException('Khung giờ này đã hết lượt đặt');
      }
    } else {
      order = Array.from({ length: maxOrder }, (_, i) => i + 1).find(
        (o) => !orders.includes(o),
      );
      if (order === undefined) {
        throw new BadRequestException(
          `Lịch khám ngày ${time_in_string} đã đầy`,
        );
      }
    }

    const orderMin = department.time_per_turn * (order - 1);
    const appointment = await this.prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        const external_code = await this.genExternalCode();
        return await tx.health_check_appointment.create({
          data: {
            medical_condition,
            time_in_string,
            department_id,
            hospital_id,
            user_id: user.id,
            patient_information,
            external_code,
            order,
          },
        });
      },
    );

    const suggest_time = dayjs()
      .startOf('date')
      .add(orderMin + 7 * 60, 'minute')
      .format('HH:mm');
    return {
      ...appointment,
      suggest_time,
    };
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

    return {
      status: true,
      message: 'Có thể đặt',
    };
  }

  async findAll(query: ListAppointmentQuery, account: accountWithRole) {
    const {
      endAt,
      search_value,
      pageIndex,
      pageSize,
      startFrom,
      department_id,
    } = query;

    const size = pageSize ?? 10;
    const index = pageIndex ?? 1;

    const whereOption: Prisma.health_check_appointmentWhereInput = {};

    switch (account.role) {
      case 'user':
        whereOption.user_id = account.id;
        break;
      case 'doctor':
        // whereOption.time_in_string = dayjs().format('YYYY-MM-DD');
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
      case 'hospital':
        whereOption.time_in_string = dateFilterString(startFrom, endAt);
        if (!!department_id) {
          whereOption.department_id = Number(department_id);
        }
        break;
      default:
        break;
    }

    if (!!search_value) {
      whereOption.OR = [
        { external_code: search_value },
        { user: { phone: search_value } },
        { user: { email: search_value } },
        { user: { identity_number: search_value } },
        { user: { social_insurance_number: search_value } },
      ];
      if (Number.isInteger(+search_value)) {
        whereOption.OR.push({ order: +search_value });
      }
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

    let department: hospital_department = null;
    if (!!department_id) {
      department = await this.prisma.hospital_department.findUnique({
        where: { id: department_id },
      });
    }

    return {
      data: data.map((d) => ({ ...d, status: getAppointmentStatus(d) })),
      total,
      ...(department_id ? { department: department.name } : {}),
    };
  }

  async getHistory(query: ListAppointmentQuery, doctor: doctorRole) {
    const { endAt, search_value, pageIndex, pageSize, startFrom } = query;

    const size = pageSize ?? 10;
    const index = pageIndex ?? 1;

    const whereOption: Prisma.health_check_appointmentWhereInput = {};

    whereOption.time_in_string = dateFilterString(startFrom, endAt);

    if (!!search_value) {
      whereOption.OR = [
        { external_code: search_value },
        { user: { phone: search_value } },
        { user: { full_name: search_value } },
        { user: { email: search_value } },
        { user: { identity_number: search_value } },
        { user: { social_insurance_number: search_value } },
      ];
    }

    if (!!doctor.department_id) {
      whereOption.department_id = doctor.department_id;
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
      data: data.map((d) => ({ ...d, status: getAppointmentStatus(d) })),
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

    // whereOption.appointment.time = dateFilter(startFrom, endAt);

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
        hospital: { select: { name: true, information: true } },
        department: { select: { name: true, time_per_turn: true } },
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

    let suggest_time: string = null;
    if (account.role === 'user') {
      suggest_time = dayjs()
        .startOf('date')
        .add(
          7 * 60 +
            appointment.department.time_per_turn * (appointment.order - 1),
          'minute',
        )
        .format('HH:mm');
    }
    return {
      ...appointment,
      status: getAppointmentStatus(appointment),
      suggest_time,
      services_result: appointment.services.flatMap((item) => {
        return item.result_image.map((img) => ({
          label: 'Kết quả ' + item.service.name,
          url: img,
        }));
      }),
    };
  }

  async assignDoctor(doctor: doctors, appointmentId: number) {
    try {
      const appointment = await this.findById(appointmentId);
      if (!appointment) {
        throw new BadRequestException('Không tìm thấy lịch hẹn');
      }

      if (!!appointment.doctor_id) {
        throw new BadRequestException('Lịch hẹn đã được tiếp nhận');
      }

      if (appointment.department_id !== doctor.department_id) {
        throw new BadRequestException('Không thể tiếp nhận lịch hẹn này');
      }

      await this.prisma.health_check_appointment.update({
        where: { id: appointment.id },
        data: { doctor_id: doctor.id },
      });

      return { status: 'success' };
    } catch (error) {
      throw error;
    }
  }

  async addServices(appointment: health_check_appointment, services: number[]) {
    try {
      const records = await this.prisma.medical_services.findMany({
        where: { id: { in: services } },
      });

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
          appointment_id: appointment.id,
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
  ) {
    try {
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
        const myServices = result.services.filter(
          (s) => s.service.service_id === doctor.service_id,
        );
        return {
          ...result,
          services: myServices,
          services_result: myServices.flatMap((item) => {
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

  async genExternalCode() {
    if (this.availableCodes.length > 0) {
      const code = this.availableCodes[0];
      this.availableCodes.shift();
      return code;
    }

    const availableCodes: string[] = [];
    while (availableCodes.length === 0) {
      const codes = [
        ...new Set(
          Array.from({ length: 3000 }, () =>
            (Math.random() + 1).toString(36).substring(4),
          ),
        ),
      ];
      const result = await this.prisma.health_check_appointment.findMany({
        where: { external_code: { in: codes } },
        select: { external_code: true },
      });

      const existed = result.map((item) => item.external_code);
      availableCodes.push(...codes.filter((code) => !existed.includes(code)));
    }

    const code = availableCodes[0];
    availableCodes.shift();
    this.availableCodes = availableCodes;
    return code;
  }
}
