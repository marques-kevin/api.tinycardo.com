import { create_testing_module } from '@/tests/create_testing_module';
import { DecksGenerateDescriptionHandler } from '@/modules/decks/handlers/decks_generate_description_handler/decks_generate_description_handler';
import { DecksCreateDeckHandler } from '@/modules/decks/handlers/decks_create_deck_handler/decks_create_deck_handler';
import { OpenAiServiceInMemory } from '@/modules/global/services/open_ai_api_service/open_ai_service_in_memory';
import { OpenAiService } from '@/modules/global/services/open_ai_api_service/open_ai_service';

describe('decks_generate_description_handler', () => {
  let handler: DecksGenerateDescriptionHandler;
  let create_handler: DecksCreateDeckHandler;
  let open_ai_service: OpenAiServiceInMemory;

  beforeEach(async () => {
    const module = await create_testing_module();
    handler = module.get(DecksGenerateDescriptionHandler);
    create_handler = module.get(DecksCreateDeckHandler);
    open_ai_service = module.get(OpenAiService);
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should generate description', async () => {
    const user_id = 'user-1';

    const deck = await create_handler.execute({
      user_id,
      name: 'Spanish Basics',
      front_language: 'es',
      back_language: 'en',
      visibility: 'private',
    });

    const params = {
      name: deck.name,
      cards: [
        { front: 'Hola', back: 'Hello' },
        { front: 'Adiós', back: 'Goodbye' },
        { front: 'Gracias', back: 'Thank you' },
      ],
      front_language: 'es',
      back_language: 'en',
    };

    const response = {
      description:
        'A comprehensive Spanish learning deck covering basic vocabulary and phrases.',
    };

    open_ai_service.generate_responses.push({
      ...handler.build_generate_description_schema(params),
      response,
    });

    const result = await handler.execute({
      user_id,
      deck_id: deck.id,
      ...params,
    });

    expect(result).toBeDefined();
    expect(result.description).toBe(response.description);
  });
});
