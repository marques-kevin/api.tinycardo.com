import { create_testing_module } from '@/tests/create_testing_module';
import { DecksCreateDeckHandler } from '@/modules/decks/handlers/decks_create_deck_handler/decks_create_deck_handler';
import { DecksUpsertCardsHandler } from '@/modules/decks/handlers/decks_upsert_cards_handler/decks_upsert_cards_handler';
import { CardsRepository } from '@/modules/cards/repositories/cards_repository';

describe('decks_upsert_cards_handler', () => {
  let create_deck: DecksCreateDeckHandler;
  let upsert_cards: DecksUpsertCardsHandler;
  let cards_repository: CardsRepository;

  beforeEach(async () => {
    const module = await create_testing_module();
    create_deck = module.get(DecksCreateDeckHandler);
    upsert_cards = module.get(DecksUpsertCardsHandler);
    cards_repository = module.get(CardsRepository);
  });

  it('should be defined', () => {
    expect(upsert_cards).toBeDefined();
  });

  it('should create cards when none exist', async () => {
    const user_id = 'user-1';
    const deck = await create_deck.execute({
      user_id,
      name: 'Deck',
      front_language: 'es',
      back_language: 'en',
      visibility: 'private',
    });

    const result = await upsert_cards.execute({
      user_id,
      deck_id: deck.id,
      cards: [
        { front: 'hola', back: 'hello' },
        { front: 'adios', back: 'bye' },
      ],
    });

    expect(result.cards_saved).toBe(2);
    expect(result.cards_removed).toBe(0);

    const saved = await cards_repository.find_all({
      where: { deck_id: deck.id },
    });
    expect(saved.length).toBe(2);
  });

  it('should update existing, add new, and remove missing cards', async () => {
    const user_id = 'user-2';
    const deck = await create_deck.execute({
      user_id,
      name: 'Deck',
      front_language: 'es',
      back_language: 'en',
      visibility: 'private',
    });

    // Seed with two cards
    const first = await upsert_cards.execute({
      user_id,
      deck_id: deck.id,
      cards: [
        { front: 'hola', back: 'hello' },
        { front: 'gracias', back: 'thanks' },
      ],
    });
    expect(first.cards_saved).toBe(2);

    const existing = await cards_repository.find_all({
      where: { deck_id: deck.id },
    });

    // Upsert: update first, remove second, add new third
    const updated = await upsert_cards.execute({
      user_id,
      deck_id: deck.id,
      cards: [
        { id: existing[0].id, front: 'hola!', back: 'hello!' },
        { front: 'adios', back: 'bye' },
      ],
    });

    expect(updated.cards_saved).toBe(2);
    expect(updated.cards_removed).toBe(1);

    const after = await cards_repository.find_all({
      where: { deck_id: deck.id },
    });
    expect(after.length).toBe(2);
    const fronts = after.map((c) => c.front).sort();
    expect(fronts).toEqual(['adios', 'hola!']);
  });

  it('should reject when user has no access to deck', async () => {
    const deck = await create_deck.execute({
      user_id: 'owner',
      name: 'Deck',
      front_language: 'es',
      back_language: 'en',
      visibility: 'private',
    });

    await expect(
      upsert_cards.execute({
        user_id: 'intruder',
        deck_id: deck.id,
        cards: [{ front: 'x', back: 'y' }],
      }),
    ).rejects.toThrow('Deck not found');
  });
});
