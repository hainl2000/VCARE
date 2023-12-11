import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import * as dayjs from 'dayjs';
import { query } from 'express';
import { PrismaService } from 'src/shared/prisma.service';

@Injectable()
export class JobsService {
  constructor(private readonly prisma: PrismaService) {}

  @Cron('0 10 0 * * *')
  async resetOrder() {
    const currentTime = dayjs().format('YYYY-MM-DD');
    const data = await this.prisma.health_check_appointment.groupBy({
      by: ['department_id'],
      where: { time_in_string: currentTime },
      _count: true,
    });

    await this.prisma.hospital_department.updateMany({
      data: { start_order: 1 },
    });

    if (data.length > 0) {
      const query = `UPDATE public.hospital_department AS h 
      SET start_order = v.start_order
      FROM (
        VALUES 
        ${data
          .map((item) => `(${item.department_id}, ${item._count + 1})`)
          .join(',')}) AS v(id, start_order)
      WHERE v.id = h.id`;
      await this.prisma.$queryRawUnsafe(query);
    }
  }
}
