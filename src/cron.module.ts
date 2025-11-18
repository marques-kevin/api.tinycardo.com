import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bullmq';
import { get_app_imports, get_app_providers } from '@/app.module';
import { cron_module } from '@/modules/cron/cron_module';

@Module({
  imports: [
    ...get_app_imports(),
    ScheduleModule.forRoot(),
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST!,
        port: parseInt(process.env.REDIS_PORT!, 10),
      },
    }),
  ],
  providers: [...get_app_providers(), ...cron_module.handlers],
})
export class CronModule {}
