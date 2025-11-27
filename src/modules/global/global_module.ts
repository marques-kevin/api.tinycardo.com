import { QueueService } from '@/modules/global/services/queue_service/queue_service';
import { QueueServiceBullMQ } from '@/modules/global/services/queue_service/queue_service_bullmq';
import { StorageService } from '@/modules/global/services/storage_service/storage_service';
import { StorageServiceS3 } from '@/modules/global/services/storage_service/storage_service_s3';
import { QueueServiceInMemory } from '@/modules/global/services/queue_service/queue_service_in_memory';
import { StorageServiceInMemory } from '@/modules/global/services/storage_service/storage_service_in_memory';
import { TextToSpeechService } from '@/modules/global/services/text_to_speech_service/text_to_speech_service';
import { TextToSpeechServiceOpenAI } from '@/modules/global/services/text_to_speech_service/text_to_speech_service_openai';
import { TextToSpeechServiceInMemory } from '@/modules/global/services/text_to_speech_service/text_to_speech_service_in_memory';
import { OpenAiService } from '@/modules/global/services/open_ai_api_service/open_ai_service';
import { OpenAiServiceApi } from '@/modules/global/services/open_ai_api_service/open_ai_service_api';
import { OpenAiServiceInMemory } from '@/modules/global/services/open_ai_api_service/open_ai_service_in_memory';
import { LoggerService } from '@/modules/global/services/logger_service/logger_service';
import { LoggerServiceOtel } from '@/modules/global/services/logger_service/logger_service_otel';
import { LoggerServiceConsole } from '@/modules/global/services/logger_service/logger_service_console';
import { UptimeService } from '@/modules/global/services/uptime_service/uptime_service';
import { UptimeServiceBetterstack } from '@/modules/global/services/uptime_service/uptime_service_betterstack';
import { UptimeServiceInMemory } from '@/modules/global/services/uptime_service/uptime_service_in_memory';

export const global_module = {
  entities: [],
  services: [
    {
      provide: LoggerService,
      useClass: LoggerServiceOtel,
    },
    {
      provide: UptimeService,
      useClass: UptimeServiceBetterstack,
    },
    {
      provide: QueueService,
      useClass: QueueServiceBullMQ,
    },
    {
      provide: StorageService,
      useClass: StorageServiceS3,
    },
    {
      provide: TextToSpeechService,
      useClass: TextToSpeechServiceOpenAI,
    },
    {
      provide: OpenAiService,
      useClass: OpenAiServiceApi,
    },
  ],
  handlers: [],
};

export const global_module_for_tests = {
  ...global_module,
  services: [
    {
      provide: LoggerService,
      useClass: LoggerServiceConsole,
    },
    {
      provide: UptimeService,
      useClass: UptimeServiceInMemory,
    },
    {
      provide: QueueService,
      useClass: QueueServiceInMemory,
    },
    {
      provide: StorageService,
      useClass: StorageServiceInMemory,
    },
    {
      provide: TextToSpeechService,
      useClass: TextToSpeechServiceInMemory,
    },
    {
      provide: OpenAiService,
      useClass: OpenAiServiceInMemory,
    },
  ],
};
