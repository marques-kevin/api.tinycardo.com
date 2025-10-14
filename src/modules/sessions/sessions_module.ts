import { SessionsController } from '@/modules/sessions/controllers/sessions_controller';
import { SessionsExplainSentenceHandler } from '@/modules/sessions/handlers/sessions_explain_sentence_handler';
import { OpenAiService } from '@/modules/sessions/services/open_ai_service';
import { OpenAiServiceApi } from '@/modules/sessions/services/open_ai_service_api';
import { OpenAiServiceInMemory } from '@/modules/sessions/services/open_ai_service_in_memory';

export const sessions_module = {
  controllers: [SessionsController],
  handlers: [SessionsExplainSentenceHandler],
  services: [
    {
      provide: OpenAiService,
      useClass: OpenAiServiceApi,
    },
  ],
};

export const sessions_module_for_tests = {
  ...sessions_module,
  services: [
    {
      provide: OpenAiService,
      useClass: OpenAiServiceInMemory,
    },
  ],
};
