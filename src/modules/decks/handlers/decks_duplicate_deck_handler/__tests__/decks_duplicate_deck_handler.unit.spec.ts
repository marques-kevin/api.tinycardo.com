import { create_testing_module } from '@/tests/create_testing_module';
import { DecksDuplicateDeckHandler } from '@/modules/decks/handlers/decks_duplicate_deck_handler/decks_duplicate_deck_handler';
import { DecksCreateDeckHandler } from '@/modules/decks/handlers/decks_create_deck_handler/decks_create_deck_handler';
import { DecksDeleteDeckHandler } from '@/modules/decks/handlers/decks_delete_deck_handler/decks_delete_deck_handler';
import { DecksUpsertCardsHandler } from '@/modules/decks/handlers/decks_upsert_cards_handler/decks_upsert_cards_handler';
import { DecksRepository } from '@/modules/decks/repositories/decks_repository';
import { CardsRepository } from '@/modules/cards/repositories/cards_repository';

describe('decks_duplicate_deck_handler', () => {
  let duplicate_handler: DecksDuplicateDeckHandler;
  let create_handler: DecksCreateDeckHandler;
  let delete_handler: DecksDeleteDeckHandler;
  let upsert_cards_handler: DecksUpsertCardsHandler;
  let decks_repository: DecksRepository;
  let cards_repository: CardsRepository;

  beforeEach(async () => {
    const module = await create_testing_module();
    duplicate_handler = module.get(DecksDuplicateDeckHandler);
    create_handler = module.get(DecksCreateDeckHandler);
    delete_handler = module.get(DecksDeleteDeckHandler);
    upsert_cards_handler = module.get(DecksUpsertCardsHandler);
    decks_repository = module.get(DecksRepository);
    cards_repository = module.get(CardsRepository);
  });

  it('should be defined', () => {
    expect(duplicate_handler).toBeDefined();
  });

  it('should duplicate a deck with new ID and owner', async () => {
    const original_user_id = 'user-1';
    const new_user_id = 'user-2';

    const original_deck = await create_handler.execute({
      user_id: original_user_id,
      name: 'Spanish Basics',
      front_language: 'es',
      back_language: 'en',
      visibility: 'private',
      description: 'Spanish basics deck',
    });

    const duplicated = await duplicate_handler.execute({
      user_id: new_user_id,
      deck_id: original_deck.id,
    });

    expect(duplicated.id).toBeDefined();
    expect(duplicated.id).not.toBe(original_deck.id);
    expect(duplicated.user_id).toBe(new_user_id);
    expect(duplicated.name).toBe('Spanish Basics (Copy)');
    expect(duplicated.front_language).toBe(original_deck.front_language);
    expect(duplicated.back_language).toBe(original_deck.back_language);
    expect(duplicated.deleted_at).toBeNull();

    const stored = await decks_repository.find_by_id(duplicated.id);
    expect(stored).toEqual(duplicated);
  });

  it('should duplicate all cards from the original deck', async () => {
    const original_user_id = 'user-1';
    const new_user_id = 'user-2';

    const original_deck = await create_handler.execute({
      user_id: original_user_id,
      name: 'Spanish Basics',
      front_language: 'es',
      back_language: 'en',
      visibility: 'private',
      description: 'Spanish basics deck',
    });

    await upsert_cards_handler.execute({
      user_id: original_user_id,
      deck_id: original_deck.id,
      cards: [
        { front: 'Hola', back: 'Hello' },
        { front: 'Adiós', back: 'Goodbye' },
        { front: 'Gracias', back: 'Thank you' },
      ],
    });

    const duplicated = await duplicate_handler.execute({
      user_id: new_user_id,
      deck_id: original_deck.id,
    });

    const original_cards = await cards_repository.find_all({
      where: { deck_id: original_deck.id },
    });

    const duplicated_cards = await cards_repository.find_all({
      where: { deck_id: duplicated.id },
    });

    expect(original_cards.length).toBe(3);
    expect(duplicated_cards.length).toBe(3);

    // Verify cards have different IDs but same content
    expect(duplicated_cards[0].id).not.toBe(original_cards[0].id);
    expect(duplicated_cards[0].deck_id).toBe(duplicated.id);

    // Verify all card content was copied
    const duplicated_fronts = duplicated_cards.map((c) => c.front).sort();
    const original_fronts = original_cards.map((c) => c.front).sort();
    expect(duplicated_fronts).toEqual(original_fronts);

    const duplicated_backs = duplicated_cards.map((c) => c.back).sort();
    const original_backs = original_cards.map((c) => c.back).sort();
    expect(duplicated_backs).toEqual(original_backs);
  });

  it('should allow user to duplicate their own deck', async () => {
    const user_id = 'user-1';

    const original = await create_handler.execute({
      user_id,
      name: 'My Deck',
      front_language: 'fr',
      back_language: 'en',
      visibility: 'private',
      description: 'My Deck',
    });

    const duplicated = await duplicate_handler.execute({
      user_id,
      deck_id: original.id,
    });

    expect(duplicated.id).not.toBe(original.id);
    expect(duplicated.user_id).toBe(user_id);
    expect(duplicated.name).toBe('My Deck (Copy)');
  });

  it('should duplicate a deck even with no cards', async () => {
    const original_user_id = 'user-1';
    const new_user_id = 'user-2';

    const original_deck = await create_handler.execute({
      user_id: original_user_id,
      name: 'Empty Deck',
      front_language: 'de',
      back_language: 'en',
      visibility: 'private',
      description: 'Empty Deck',
    });

    const duplicated = await duplicate_handler.execute({
      user_id: new_user_id,
      deck_id: original_deck.id,
    });

    expect(duplicated.id).toBeDefined();
    expect(duplicated.name).toBe('Empty Deck (Copy)');

    const duplicated_cards = await cards_repository.find_all({
      where: { deck_id: duplicated.id },
    });

    expect(duplicated_cards.length).toBe(0);
  });

  it('should throw when trying to duplicate a non-existent deck', async () => {
    await expect(
      duplicate_handler.execute({
        user_id: 'user-1',
        deck_id: 'non-existent-id',
      }),
    ).rejects.toThrow('Deck not found');
  });

  it('should throw when trying to duplicate a deleted deck', async () => {
    const user_id = 'user-1';

    const deck = await create_handler.execute({
      user_id,
      name: 'Deck to delete',
      front_language: 'es',
      back_language: 'en',
      visibility: 'private',
      description: 'Deck to delete',
    });

    await delete_handler.execute({
      user_id,
      id: deck.id,
    });

    await expect(
      duplicate_handler.execute({
        user_id: 'user-2',
        deck_id: deck.id,
      }),
    ).rejects.toThrow('Deck not found');
  });
});
