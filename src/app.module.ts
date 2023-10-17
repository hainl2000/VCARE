import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { OpenApiModule } from './modules/openapi.module';
import { SharedModule } from './shared/shared.module';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/environment-configuration';
@Module({
  imports: [
    AuthModule,
    SharedModule,
    OpenApiModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
