import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import { AuthModule } from './auth/auth.module';
import configuration from './config/environment-configuration';
import { RequestMiddleware } from './core/request.middleware';
import { OpenApiModule } from './modules/openapi.module';
import { SharedModule } from './shared/shared.module';
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
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequestMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
