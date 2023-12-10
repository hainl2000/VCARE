import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma.service';
import { Prisma, users } from '@prisma/client';
import { getMeaningfulData } from 'src/utils/common';
import { UpdateHeathStatusDto  } from './health-status.dto';

@Injectable()
export class HealthStatusService {
    constructor(private readonly prisma: PrismaService) {}

    async update(data: UpdateHeathStatusDto, user: users) {
      const currentStatus = user.health_status as Prisma.JsonObject;
      const updateData = getMeaningfulData(data);
      const health_status = { ... currentStatus, ...updateData };
      const update = await this.prisma.users.update({
        where: { id: user.id },
        data: { health_status },
      });

      return this.getHealthStatus(update);
    }

    getHealthStatus(user: users) {
      const result: Record<string, any> = {
        height: null,
        weight: null,
        blood_type: null,
        blood_pressure: null,
      };

      const currentStatus = user.health_status as Prisma.JsonObject;
      Object.keys(result).forEach((key:string) => {
        result[key] = currentStatus[key] ?? null;
      });

      return result;
    }
}
