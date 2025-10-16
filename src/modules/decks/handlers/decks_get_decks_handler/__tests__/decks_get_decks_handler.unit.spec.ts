import { create_testing_module } from '@/tests/create_testing_module';
import { DecksGetDecksHandler } from '@/modules/decks/handlers/decks_get_decks_handler/decks_get_decks_handler';
import { DecksCreateDeckHandler } from '@/modules/decks/handlers/decks_create_deck_handler/decks_create_deck_handler';
import { DecksRepository } from '@/modules/decks/repositories/decks_repository';

describe('decks_get_decks_handler', () => {
  let get_handler: DecksGetDecksHandler;
  let create_handler: DecksCreateDeckHandler;
  let decks_repository: DecksRepository;

  beforeEach(async () => {
    const module = await create_testing_module();
    get_handler = module.get(DecksGetDecksHandler);
    create_handler = module.get(DecksCreateDeckHandler);
    decks_repository = module.get(DecksRepository);
  });

  it('should be defined', () => {
    expect(get_handler).toBeDefined();
  });

  it('should return only the user decks, ordered by created_at DESC', async () => {
    const userA = 'user-A';
    const userB = 'user-B';

    // Create decks for both users
    const older = await create_handler.execute({
      user_id: userA,
      name: 'A-older',
      front_language: 'es',
      back_language: 'en',
    });

    const newer = await create_handler.execute({
      user_id: userA,
      name: 'A-newer',
      front_language: 'es',
      back_language: 'en',
    });

    // Normalize created_at values to control ordering
    older.created_at = new Date('2023-01-01T00:00:00.000Z');
    newer.created_at = new Date('2023-01-02T00:00:00.000Z');
    await decks_repository.save(older);
    await decks_repository.save(newer);

    // Deck for another user should not be returned
    await create_handler.execute({
      user_id: userB,
      name: 'B-deck',
      front_language: 'fr',
      back_language: 'en',
    });

    const result = await get_handler.execute({ user_id: userA });

    expect(result.length).toBe(2);
    expect(result[0].name).toBe('A-newer');
    expect(result[1].name).toBe('A-older');
  });

  it('should honor take and skip parameters', async () => {
    const user_id = 'user-C';

    const c1 = await create_handler.execute({
      user_id,
      name: 'C-1',
      front_language: 'es',
      back_language: 'en',
    });
    const c2 = await create_handler.execute({
      user_id,
      name: 'C-2',
      front_language: 'es',
      back_language: 'en',
    });
    const c3 = await create_handler.execute({
      user_id,
      name: 'C-3',
      front_language: 'es',
      back_language: 'en',
    });

    // Ensure deterministic created_at ordering: DESC => [C-3, C-2, C-1]
    c1.created_at = new Date('2023-01-01T00:00:00.000Z');
    c2.created_at = new Date('2023-01-02T00:00:00.000Z');
    c3.created_at = new Date('2023-01-03T00:00:00.000Z');
    await decks_repository.save(c1);
    await decks_repository.save(c2);
    await decks_repository.save(c3);

    const result = await get_handler.execute({ user_id, take: 2, skip: 1 });

    expect(result.length).toBe(2);
    // With created_at ordering DESC, the first created is the latest
    // We created C-1, C-2, C-3 in order, so DESC => [C-3, C-2, C-1]
    // skip:1, take:2 => [C-2, C-1]
    const names = result.map((d) => d.name);
    expect(names).toEqual(['C-2', 'C-1']);
  });
});
