import { create_testing_module } from '@/tests/create_testing_module';
import { DecksGetDeckByIdHandler } from '@/modules/decks/handlers/decks_get_deck_by_id_handler/decks_get_deck_by_id_handler';
import { DecksCreateDeckHandler } from '@/modules/decks/handlers/decks_create_deck_handler/decks_create_deck_handler';
import { DecksDeleteDeckHandler } from '@/modules/decks/handlers/decks_delete_deck_handler/decks_delete_deck_handler';

describe('decks_get_deck_by_id_handler', () => {
  let get_deck_by_id_handler: DecksGetDeckByIdHandler;
  let create_handler: DecksCreateDeckHandler;
  let delete_handler: DecksDeleteDeckHandler;

  beforeEach(async () => {
    const module = await create_testing_module();
    get_deck_by_id_handler = module.get(DecksGetDeckByIdHandler);
    create_handler = module.get(DecksCreateDeckHandler);
    delete_handler = module.get(DecksDeleteDeckHandler);
  });

  it('should be defined', () => {
    expect(get_deck_by_id_handler).toBeDefined();
  });

  it('should get a public deck', async () => {
    const deck = await create_handler.execute({
      user_id: 'user-1',
      name: 'Public Deck',
      front_language: 'es',
      back_language: 'en',
      visibility: 'public',
      description: 'Public deck',
    });

    const result = await get_deck_by_id_handler.execute({
      id: deck.id,
      user_id: 'user-2',
    });

    expect(result).toBeDefined();
    expect(result.deck.id).toBe(deck.id);
    expect(result.deck.name).toBe('Public Deck');
    expect(result.deck.visibility).toBe('public');
  });

  it('should get a public deck with any user', async () => {
    const deck = await create_handler.execute({
      user_id: 'user-1',
      name: 'Public Deck',
      front_language: 'es',
      back_language: 'en',
      visibility: 'public',
      description: 'Public deck',
    });

    const result = await get_deck_by_id_handler.execute({
      id: deck.id,
      user_id: 'user-2',
    });

    expect(result).toBeDefined();
    expect(result.deck.id).toBe(deck.id);
  });

  it('should get an unlisted deck', async () => {
    const deck = await create_handler.execute({
      user_id: 'user-1',
      name: 'Unlisted Deck',
      front_language: 'es',
      back_language: 'en',
      visibility: 'unlisted',
      description: 'Unlisted deck',
    });

    const result = await get_deck_by_id_handler.execute({
      id: deck.id,
      user_id: 'user-2',
    });

    expect(result).toBeDefined();
    expect(result.deck.id).toBe(deck.id);
    expect(result.deck.visibility).toBe('unlisted');
  });

  it('should get a private deck if user is the owner', async () => {
    const user_id = 'user-1';

    const deck = await create_handler.execute({
      user_id,
      name: 'Private Deck',
      front_language: 'es',
      back_language: 'en',
      visibility: 'private',
      description: 'Private deck',
    });

    const result = await get_deck_by_id_handler.execute({
      id: deck.id,
      user_id,
    });

    expect(result).toBeDefined();
    expect(result.deck.id).toBe(deck.id);
    expect(result.deck.visibility).toBe('private');
  });

  it('should throw ForbiddenException when accessing private deck without authentication', async () => {
    const deck = await create_handler.execute({
      user_id: 'user-1',
      name: 'Private Deck',
      front_language: 'es',
      back_language: 'en',
      visibility: 'private',
      description: 'Private deck',
    });

    await expect(
      get_deck_by_id_handler.execute({
        id: deck.id,
        user_id: 'other',
      }),
    ).rejects.toThrow('Access denied: This deck is private');
  });

  it('should throw ForbiddenException when accessing private deck as non-owner', async () => {
    const deck = await create_handler.execute({
      user_id: 'user-1',
      name: 'Private Deck',
      front_language: 'es',
      back_language: 'en',
      visibility: 'private',
      description: 'Private deck',
    });

    await expect(
      get_deck_by_id_handler.execute({
        id: deck.id,
        user_id: 'user-2',
      }),
    ).rejects.toThrow('Access denied: This deck is private');
  });

  it('should throw NotFoundException when deck does not exist', async () => {
    await expect(
      get_deck_by_id_handler.execute({
        id: 'non-existent-id',
        user_id: 'user-2',
      }),
    ).rejects.toThrow('Deck not found');
  });

  it('should throw NotFoundException when accessing a deleted deck ', async () => {
    const owner_id = 'user-1';
    const deck = await create_handler.execute({
      user_id: owner_id,
      name: 'Deck to delete',
      front_language: 'es',
      back_language: 'en',
      visibility: 'public',
      description: 'Deck to delete',
    });

    await delete_handler.execute({
      user_id: owner_id,
      id: deck.id,
    });

    await expect(
      get_deck_by_id_handler.execute({
        id: deck.id,
        user_id: 'other',
      }),
    ).rejects.toThrow('Deck not found');
  });

  it('should return correct deck properties', async () => {
    const deck = await create_handler.execute({
      user_id: 'user-1',
      name: 'Test Deck',
      front_language: 'fr',
      back_language: 'en',
      visibility: 'public',
      description: 'Test description',
    });

    const result = await get_deck_by_id_handler.execute({
      id: deck.id,
      user_id: 'user-2',
    });

    expect(result.deck.name).toBe('Test Deck');
    expect(result.deck.front_language).toBe('fr');
    expect(result.deck.back_language).toBe('en');
    expect(result.deck.user_id).toBe('user-1');
    expect(result.deck.description).toBe('Test description');
    expect(result.deck.created_at).toBeInstanceOf(Date);
    expect(result.deck.updated_at).toBeInstanceOf(Date);
    expect(result.deck.deleted_at).toBeNull();
  });

  it('should get a private deck by non-owner if visibility is unlisted', async () => {
    const deck = await create_handler.execute({
      user_id: 'user-1',
      name: 'Unlisted Deck',
      front_language: 'de',
      back_language: 'en',
      visibility: 'unlisted',
      description: 'Unlisted deck',
    });

    const result = await get_deck_by_id_handler.execute({
      id: deck.id,
      user_id: 'user-2',
    });

    expect(result).toBeDefined();
    expect(result.deck.id).toBe(deck.id);
    expect(result.deck.visibility).toBe('unlisted');
  });
});
