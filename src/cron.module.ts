import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bullmq';
import { get_app_imports, get_app_providers } from '@/app.module';
import { cron_module } from '@/modules/cron/cron_module';
import { CardsTextToSpeechCronHandler } from '@/modules/cards/handlers/cards_text_to_speech_cron_handler/cards_text_to_speech_cron_handler';
import { CARDS_TEXT_TO_SPEECH_QUEUE } from '@/modules/cards/handlers/cards_text_to_speech_cron_handler/cards_text_to_speech_cron_handler';

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
    BullModule.registerQueue({
      name: CARDS_TEXT_TO_SPEECH_QUEUE,
    }),
  ],
  providers: [
    ...get_app_providers(),
    ...cron_module.handlers,
    CardsTextToSpeechCronHandler,
  ],
})
export class CronModule {}
