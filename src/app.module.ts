import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import {
  ExecutionContext,
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { join } from 'path';
import { AuthModule } from './auth/auth.module';
import configuration from './config/environment-configuration';
import { RequestMiddleware } from './core/request.middleware';
import { OpenApiModule } from './modules/openapi.module';
import { SharedModule } from './shared/shared.module';
import { UploadModule } from './upload/upload.module';
import { JobsModule } from './jobs/jobs.module';
@Module({
  imports: [
    AuthModule,
    SharedModule,
    OpenApiModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    MailerModule.forRoot({
      transport: {
        service: 'gmail',
        auth: {
          user: process.env.SENDER_USER,
          pass: process.env.SENDER_PASS,
        },
      },
      template: {
        dir: join(__dirname, 'templates'),
        adapter: new HandlebarsAdapter(),
      },
    }),
    ThrottlerModule.forRoot([{ name: 'payment', limit: 1, ttl: 5000 }]),
    ScheduleModule.forRoot(),
    UploadModule,
    JobsModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequestMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
