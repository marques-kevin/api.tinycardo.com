import '@/instruments/sentry';
import { NestFactory } from '@nestjs/core';
import { CronModule } from '@/cron.module';
import { Logger } from 'nestjs-pino';

async function bootstrap() {
  const app = await NestFactory.create(CronModule, {
    bufferLogs: true,
  });
  app.useLogger(app.get(Logger));
  await app.init();
}

bootstrap();
