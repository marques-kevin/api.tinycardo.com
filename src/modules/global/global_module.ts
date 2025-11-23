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

export const global_module = {
  services: [
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
};

export const global_module_for_tests = {
  ...global_module,
  services: [
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
