import { create_testing_module } from '@/tests/create_testing_module';
import { DecksUpdateDeckHandler } from '@/modules/decks/handlers/decks_update_deck_handler';
import { DecksRepository } from '@/modules/decks/repositories/decks_repository';
import { DecksCreateDeckHandler } from '@/modules/decks/handlers/decks_create_deck_handler';

describe('decks_update_deck_handler', () => {
  let update_handler: DecksUpdateDeckHandler;
  let create_handler: DecksCreateDeckHandler;
  let decks_repository: DecksRepository;

  beforeEach(async () => {
    const module = await create_testing_module();
    update_handler = module.get(DecksUpdateDeckHandler);
    create_handler = module.get(DecksCreateDeckHandler);
    decks_repository = module.get(DecksRepository);
  });

  it('should be defined', () => {
    expect(update_handler).toBeDefined();
  });

  it('should update an existing deck fields', async () => {
    const user_id = 'user-1';
    const created = await create_handler.execute({
      user_id,
      name: 'Spanish Basics',
      front_language: 'es',
      back_language: 'en',
    });

    const updated = await update_handler.execute({
      user_id,
      id: created.id,
      name: 'Spanish Advanced',
      front_language: 'es-ES',
    });

    expect(updated.id).toBe(created.id);
    expect(updated.user_id).toBe(user_id);
    expect(updated.name).toBe('Spanish Advanced');
    expect(updated.front_language).toBe('es-ES');
    expect(updated.back_language).toBe('en');

    const stored = await decks_repository.find_by_id(created.id);
    expect(stored).toEqual(updated);
  });

  it('should throw when user does not own the deck', async () => {
    const created = await create_handler.execute({
      user_id: 'owner',
      name: 'Deck',
      front_language: 'fr',
      back_language: 'en',
    });

    await expect(
      update_handler.execute({
        user_id: 'intruder',
        id: created.id,
        name: 'Hack',
      }),
    ).rejects.toThrow('Deck not found');
  });
});
