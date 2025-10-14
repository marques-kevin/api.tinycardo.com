import { create_testing_module } from '@/tests/create_testing_module';
import { DecksCreateDeckHandler } from '@/modules/decks/handlers/decks_create_deck_handler';
import { DecksRepository } from '@/modules/decks/repositories/decks_repository';

describe('decks_create_deck_handler', () => {
  let handler: DecksCreateDeckHandler;
  let decks_repository: DecksRepository;

  beforeEach(async () => {
    const module = await create_testing_module();
    handler = module.get(DecksCreateDeckHandler);
    decks_repository = module.get(DecksRepository);
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should create and persist a deck', async () => {
    const result = await handler.execute({
      user_id: 'user-1',
      name: 'Spanish Basics',
      front_language: 'es',
      back_language: 'en',
    });

    expect(result).toBeDefined();
    expect(result.id).toBeDefined();
    expect(result.user_id).toBe('user-1');
    expect(result.name).toBe('Spanish Basics');
    expect(result.front_language).toBe('es');
    expect(result.back_language).toBe('en');

    const saved = await decks_repository.find_all({
      where: { user_id: 'user-1' },
    });
    expect(saved.length).toBe(1);
    expect(saved[0]).toEqual(
      expect.objectContaining({
        user_id: 'user-1',
        name: 'Spanish Basics',
        front_language: 'es',
        back_language: 'en',
      }),
    );
  });
});
