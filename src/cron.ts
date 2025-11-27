import '@/instruments/telemetry';
import '@/instruments/sentry';
import { NestFactory } from '@nestjs/core';
import { CronModule } from '@/cron.module';
import { GlobalCatchAllExceptionFilter } from '@/modules/global/filters/global_catch_all_exception_filter';

async function bootstrap() {
  const app = await NestFactory.create(CronModule);
  app.useGlobalFilters(new GlobalCatchAllExceptionFilter());

  await app.init();
}

bootstrap();
