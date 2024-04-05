import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { createDocument } from './docs/swagger';
import { ValidationExceptionFilter } from './pipes/validate.pipe';
import { ValidationPipe } from '@nestjs/common';
import { ConvertDateInterceptors } from './pipes/convert-date.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: '*' });
  app.useGlobalFilters(new ValidationExceptionFilter());
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.useGlobalInterceptors(new ConvertDateInterceptors());
  createDocument(app);
  await app.listen(80);
}
bootstrap();
