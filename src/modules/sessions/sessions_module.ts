import { SessionsController } from '@/modules/sessions/controllers/sessions_controller';
import { SessionsExplainSentenceHandler } from '@/modules/sessions/handlers/sessions_explain_sentence_handler/sessions_explain_sentence_handler';

export const sessions_module = {
  controllers: [SessionsController],
  handlers: [SessionsExplainSentenceHandler],
  services: [],
};

export const sessions_module_for_tests = {
  ...sessions_module,
  services: [],
};
