import { create_testing_module } from '@/tests/create_testing_module';
import { SessionsExplainSentenceHandler } from '@/modules/sessions/handlers/sessions_explain_sentence_handler/sessions_explain_sentence_handler';
import { OpenAiService } from '@/modules/sessions/services/open_ai_service';

describe('sessions_explain_sentence_handler', () => {
  let handler: SessionsExplainSentenceHandler;
  let open_ai_service: OpenAiService;

  beforeEach(async () => {
    const module = await create_testing_module();
    handler = module.get(SessionsExplainSentenceHandler);
    open_ai_service = module.get(OpenAiService);
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should explain a sentence and return markdown explanation', async () => {
    const result = await handler.execute({
      sentence_to_explain: "Je voudrais un café, s'il vous plaît",
      language_of_sentence: 'French',
      language_of_the_explanation: 'English',
    });

    expect(result).toBeDefined();
    expect(result.explanation).toBeDefined();
    expect(typeof result.explanation).toBe('string');
    expect(result.explanation.length).toBeGreaterThan(0);
    expect(result.explanation).toContain(
      "Je voudrais un café, s'il vous plaît",
    );
  });

  it('should call open_ai_service with correct parameters', async () => {
    const spy = jest.spyOn(open_ai_service, 'explain_sentence');

    await handler.execute({
      sentence_to_explain: 'Bonjour',
      language_of_sentence: 'French',
      language_of_the_explanation: 'English',
    });

    expect(spy).toHaveBeenCalledWith({
      sentence_to_explain: 'Bonjour',
      language_of_sentence: 'French',
      language_of_the_explanation: 'English',
    });
  });

  it('should handle different language combinations', async () => {
    const result = await handler.execute({
      sentence_to_explain: 'Hello, how are you?',
      language_of_sentence: 'English',
      language_of_the_explanation: 'Spanish',
    });

    expect(result).toBeDefined();
    expect(result.explanation).toBeDefined();
    expect(result.explanation).toContain('Hello, how are you?');
  });
});
