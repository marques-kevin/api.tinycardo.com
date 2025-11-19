import { create_testing_module } from '@/tests/create_testing_module';
import { DecksDeleteDeckHandler } from '@/modules/decks/handlers/decks_delete_deck_handler/decks_delete_deck_handler';
import { DecksCreateDeckHandler } from '@/modules/decks/handlers/decks_create_deck_handler/decks_create_deck_handler';
import { DecksGetDecksHandler } from '@/modules/decks/handlers/decks_get_decks_handler/decks_get_decks_handler';
import { DecksRepository } from '@/modules/decks/repositories/decks_repository';

describe('decks_delete_deck_handler', () => {
  let delete_handler: DecksDeleteDeckHandler;
  let create_handler: DecksCreateDeckHandler;
  let get_decks_handler: DecksGetDecksHandler;
  let decks_repository: DecksRepository;

  beforeEach(async () => {
    const module = await create_testing_module();
    delete_handler = module.get(DecksDeleteDeckHandler);
    create_handler = module.get(DecksCreateDeckHandler);
    get_decks_handler = module.get(DecksGetDecksHandler);
    decks_repository = module.get(DecksRepository);
  });

  it('should be defined', () => {
    expect(delete_handler).toBeDefined();
  });

  it('should soft delete a deck by setting deleted_at', async () => {
    const user_id = 'user-1';
    const created = await create_handler.execute({
      user_id,
      name: 'Spanish Basics',
      front_language: 'es',
      back_language: 'en',
      visibility: 'private',
    });

    expect(created.deleted_at).toBeNull();

    await delete_handler.execute({
      user_id,
      id: created.id,
    });

    const deck = await decks_repository.find_by_id(created.id);
    expect(deck).toBeDefined();
    expect(deck?.deleted_at).toBeDefined();
    expect(deck?.deleted_at).toBeInstanceOf(Date);
  });

  it('should not show deleted decks in get_decks', async () => {
    const user_id = 'user-1';
    const deck1 = await create_handler.execute({
      user_id,
      name: 'Deck 1',
      front_language: 'es',
      back_language: 'en',
      visibility: 'private',
    });

    const deck2 = await create_handler.execute({
      user_id,
      name: 'Deck 2',
      front_language: 'fr',
      back_language: 'en',
      visibility: 'private',
    });

    const before_delete = await get_decks_handler.execute({ user_id });
    expect(before_delete.length).toBe(2);

    await delete_handler.execute({
      user_id,
      id: deck1.id,
    });

    const after_delete = await get_decks_handler.execute({ user_id });
    expect(after_delete.length).toBe(1);
    expect(after_delete[0].id).toBe(deck2.id);
  });

  it('should throw when user does not own the deck', async () => {
    const created = await create_handler.execute({
      user_id: 'owner',
      name: 'Deck',
      front_language: 'fr',
      back_language: 'en',
      visibility: 'private',
    });

    await expect(
      delete_handler.execute({
        user_id: 'intruder',
        id: created.id,
      }),
    ).rejects.toThrow('Access denied: You must be the owner of this deck');

    const deck = await decks_repository.find_by_id(created.id);
    expect(deck?.deleted_at).toBeNull();
  });

  it('should throw when trying to delete a non-existent deck', async () => {
    await expect(
      delete_handler.execute({
        user_id: 'user-1',
        id: 'non-existent-id',
      }),
    ).rejects.toThrow('Deck not found');
  });
});
