import '@/instruments/sentry';

import { NestFactory } from '@nestjs/core';
import { AppModule } from '@/app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ZodValidationPipe } from 'nestjs-zod';
import { Logger } from 'nestjs-pino';
import { GlobalCatchAllExceptionFilter } from '@/modules/global/filters/global_catch_all_exception_filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  app.useLogger(app.get(Logger));
  app.useGlobalFilters(new GlobalCatchAllExceptionFilter());
  app.useGlobalPipes(new ZodValidationPipe());

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Tinycardo API')
    .setDescription('The Tinycardo API documentation')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, document);

  app.enableCors();

  app.listen(process.env.PORT || 3000);
}

bootstrap();
