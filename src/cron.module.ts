import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { get_app_imports } from '@/app.module';
import { cron_module } from '@/modules/cron/cron_module';

@Module({
  imports: [...get_app_imports(), ScheduleModule.forRoot()],
  providers: [...cron_module.handlers],
})
export class CronModule {}
