import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma.service';
import { CreateUserDto, UpdatePatientProfileDto } from './user.dto';
import { generateHashPass, getAccountSafeData } from 'src/utils/_security';
import { Prisma, users } from '@prisma/client';
import {
  checkFieldUpdateUser,
  accountPrivateField,
  userField,
} from 'src/constants/type';
import * as dayjs from 'dayjs';
import { identity, throwError } from 'rxjs';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateUserDto) {
    try {
      const { email, phone } = data;
      const existed = await this.prisma.users.findFirst({
        where: { OR: [{ email }, { phone }] },
      });

      if (!!existed) {
        throw new BadRequestException('Email/SĐT đã tồn tại trên hệ thống');
      }

      data.password = generateHashPass(data.password);

      return await this.prisma.users.create({ data });
    } catch (error) {
      throw error;
    }
  }

  async findUserByUserName(username: string) {
    try {
      const user = await this.prisma.users.findFirst({
        where: { OR: [{ phone: username }, { email: username }] },
      });

      if (!user) {
        throw new NotFoundException('Không tồn tại tài khoản này');
      }

      return user;
    } catch (error) {
      throw error;
    }
  }

  async findByUniq(
    data: {
      phone?: string;
      email?: string;
      identity_number?: string;
      social_insurance_number?: string;
    },
    ignore?: number,
  ) {
    try {
      const { identity_number, social_insurance_number, phone, email } = data;
      if (!identity_number && !social_insurance_number && !phone && !email) {
        return null;
      }
      const whereOption: Prisma.usersWhereInput[] = [];
      if (!!identity_number) {
        whereOption.push({ identity_number });
      }

      if (!!phone) {
        whereOption.push({ phone });
      }

      if (!!email) {
        whereOption.push({ email });
      }

      if (!!social_insurance_number) {
        whereOption.push({ social_insurance_number });
      }

      const user = await this.prisma.users.findFirst({
        where: {
          OR: whereOption,
          id: { not: ignore ?? 0 },
        },
      });

      return user;
    } catch (error) {
      throw error;
    }
  }

  async update(
    target: users | number,
    data: Prisma.XOR<Prisma.usersUpdateInput, Prisma.usersUncheckedUpdateInput>,
  ) {
    let user: users;
    if (typeof target === 'number') {
      user = await this.prisma.users.findUnique({ where: { id: target } });
    } else user = target;
    const log = Object.keys(data).reduce(
      (pre: Record<string, any>, key: userField) => {
        if (checkFieldUpdateUser.includes(key) && user[key] !== data[key]) {
          pre[key] = `${user[key]} -> ${data[key]}`;
        }
        return pre;
      },
      {
        time: dayjs().valueOf(),
      },
    );

    if (log['social_insurance_number'] || log['identity_number']) {
      const existed = await this.findByUniq(
        {
          social_insurance_number: data.social_insurance_number as string,
          identity_number: data.identity_number as string,
        },
        user.id,
      );

      if (existed) {
        throw new BadRequestException('Trùng lặp thông tin');
      }
    }

    if (Object.keys(log).length > 1) {
      data.change_history = user.change_history as Prisma.JsonArray;
      data.change_history = [...data.change_history, log];
    }

    try {
      const result = await this.prisma.users.update({
        where: { id: user.id },
        data,
      });

      return getAccountSafeData(result);
    } catch (error) {
      throw error;
    }
  }

  async findById(id: number) {
    try {
      return await this.prisma.users.findUnique({ where: { id } });
    } catch (error) {
      throw error;
    }
  }
  async updatePatientProfile(userId: number, data: UpdatePatientProfileDto) {
    try {
      await this.prisma.patient_profile.create({
        data: {
          user_id: userId,
          url: data.url,
        },
      });
      return {
        message: 'SUCCESS',
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async getPatientProfile(userId: number) {
    const data = await this.prisma.patient_profile.findMany({
      where: {
        user_id: userId,
      },
    });
    const urlArr = data?.map((item) => item.url);
    const result = urlArr
      .filter((item) => {
        if (item.includes('.jpg') || item.includes('.png')) {
          return item;
        }
      })
      .concat(
        urlArr.filter((item) => {
          if (!item.includes('.jpg') && !item.includes('.png')) {
            return item;
          }
        }),
      );
    return {
      data: result,
    };
  }
}
