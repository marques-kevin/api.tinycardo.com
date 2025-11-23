import { create_testing_module } from '@/tests/create_testing_module';
import { DecksTranslateCardWithAiHandler } from '@/modules/decks/handlers/decks_translate_card_with_ai_handler/decks_translate_card_with_ai_handler';
import { OpenAiServiceInMemory } from '@/modules/global/services/open_ai_api_service/open_ai_service_in_memory';
import { OpenAiService } from '@/modules/global/services/open_ai_api_service/open_ai_service';

describe('decks_translate_card_with_ai_handler', () => {
  let handler: DecksTranslateCardWithAiHandler;
  let open_ai_service: OpenAiServiceInMemory;

  beforeEach(async () => {
    const module = await create_testing_module();
    handler = module.get(DecksTranslateCardWithAiHandler);
    open_ai_service = module.get(OpenAiService);
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should translate text from front language to back language', async () => {
    const params = {
      front: 'Hola',
      back: '',
      front_language: 'es',
      back_language: 'en',
    };

    const response = { translation: 'Hello' };

    open_ai_service.generate_responses.push({
      ...handler.build_translate_schema(params),
      response,
    });

    const result = await handler.execute(params);

    expect(result).toBeDefined();
    expect(result.front).toBe(params.front);
    expect(result.back).toBe(response.translation);
  });
});
