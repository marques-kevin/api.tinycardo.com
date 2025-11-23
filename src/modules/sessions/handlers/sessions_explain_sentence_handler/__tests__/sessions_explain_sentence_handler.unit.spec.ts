import { create_testing_module } from '@/tests/create_testing_module';
import { SessionsExplainSentenceHandler } from '@/modules/sessions/handlers/sessions_explain_sentence_handler/sessions_explain_sentence_handler';
import { OpenAiService } from '@/modules/global/services/open_ai_api_service/open_ai_service';
import { OpenAiServiceInMemory } from '@/modules/global/services/open_ai_api_service/open_ai_service_in_memory';

describe('sessions_explain_sentence_handler', () => {
  let handler: SessionsExplainSentenceHandler;
  let open_ai_service: OpenAiServiceInMemory;

  beforeEach(async () => {
    const module = await create_testing_module();
    handler = module.get(SessionsExplainSentenceHandler);
    open_ai_service = module.get(OpenAiService);
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should handle different language combinations', async () => {
    const params = {
      sentence_to_explain: 'Hello, how are you?',
      language_of_sentence: 'English',
      language_of_the_explanation: 'Spanish',
    };

    const response = {
      markdown_explanation: 'Hello, how are you? is a greeting in Spanish.',
    };

    open_ai_service.generate_responses.push({
      ...handler.generate_params(params),
      response,
    });

    const result = await handler.execute(params);

    expect(result).toBeDefined();
    expect(result.explanation).toBeDefined();
    expect(result.explanation).toContain('Hello, how are you?');
  });
});
