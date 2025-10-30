import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { get_app_imports, get_app_providers } from '@/app.module';
import { cron_module } from '@/modules/cron/cron_module';

@Module({
  imports: [...get_app_imports(), ScheduleModule.forRoot()],
  providers: [...get_app_providers(), ...cron_module.handlers],
})
export class CronModule {}
