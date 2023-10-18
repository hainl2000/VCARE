require('dotenv').config();

import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as basicAuth from 'express-basic-auth';
import { SWAGGER_CONFIG } from './swagger.config';
import { ENV } from 'src/constants/type';

/**
 * Creates an OpenAPI document for an application, via swagger.
 * @param app the nestjs application
 * @returns the OpenAPI document
 */
const env = process.env;
export function createDocument(app: INestApplication) {
  const builder = new DocumentBuilder()
    .setTitle(SWAGGER_CONFIG.title)
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'authorization',
    )
    .setDescription(SWAGGER_CONFIG.description)
    .setVersion(SWAGGER_CONFIG.version);
  for (const tag of SWAGGER_CONFIG.tags) {
    builder.addTag(tag);
  }
  const apiPrefix = env.ENV === ENV.dev ? '/api' : '/';
  builder.addServer(apiPrefix);
  const options = builder.build();
  const username = env.SWAGGER_USERNAME || 'vcare';
  const password = env.SWAGGER_PASSWORD || 'vcare';
  app.use(
    '/docs',
    basicAuth({
      challenge: true,
      users: {
        [username]: password,
      },
    }),
  );
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('docs', app, document);
}
