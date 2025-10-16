import { create_testing_module } from '@/tests/create_testing_module';
import { CardsGetCardsHandler } from '@/modules/cards/handlers/cards_get_cards_handler/cards_get_cards_handler';
import { CardsCreateCardHandler } from '@/modules/cards/handlers/cards_create_card_handler/cards_create_card_handler';
import { DecksCreateDeckHandler } from '@/modules/decks/handlers/decks_create_deck_handler/decks_create_deck_handler';

describe('cards_get_cards_handler', () => {
  let get_cards_handler: CardsGetCardsHandler;
  let create_card_handler: CardsCreateCardHandler;
  let create_deck_handler: DecksCreateDeckHandler;

  beforeEach(async () => {
    const module = await create_testing_module();
    get_cards_handler = module.get(CardsGetCardsHandler);
    create_card_handler = module.get(CardsCreateCardHandler);
    create_deck_handler = module.get(DecksCreateDeckHandler);
  });

  it('should be defined', () => {
    expect(get_cards_handler).toBeDefined();
  });

  it('should get all cards for a deck', async () => {
    const deck = await create_deck_handler.execute({
      user_id: 'user-1',
      name: 'Spanish Basics',
      front_language: 'es',
      back_language: 'en',
    });

    await create_card_handler.execute({
      user_id: 'user-1',
      deck_id: deck.id,
      front: 'Hola',
      back: 'Hello',
    });

    await create_card_handler.execute({
      user_id: 'user-1',
      deck_id: deck.id,
      front: 'Adiós',
      back: 'Goodbye',
    });

    await create_card_handler.execute({
      user_id: 'user-1',
      deck_id: deck.id,
      front: 'Gracias',
      back: 'Thank you',
    });

    const result = await get_cards_handler.execute({
      user_id: 'user-1',
      deck_id: deck.id,
    });

    expect(result.length).toBe(3);
    expect(result[0].front).toBe('Hola');
    expect(result[1].front).toBe('Adiós');
    expect(result[2].front).toBe('Gracias');
  });

  it('should return empty array when deck has no cards', async () => {
    const deck = await create_deck_handler.execute({
      user_id: 'user-1',
      name: 'Empty Deck',
      front_language: 'es',
      back_language: 'en',
    });

    const result = await get_cards_handler.execute({
      user_id: 'user-1',
      deck_id: deck.id,
    });

    expect(result.length).toBe(0);
  });

  it('should only return cards for the specified deck', async () => {
    const deck1 = await create_deck_handler.execute({
      user_id: 'user-1',
      name: 'Spanish Basics',
      front_language: 'es',
      back_language: 'en',
    });

    const deck2 = await create_deck_handler.execute({
      user_id: 'user-1',
      name: 'French Basics',
      front_language: 'fr',
      back_language: 'en',
    });

    await create_card_handler.execute({
      user_id: 'user-1',
      deck_id: deck1.id,
      front: 'Hola',
      back: 'Hello',
    });

    await create_card_handler.execute({
      user_id: 'user-1',
      deck_id: deck2.id,
      front: 'Bonjour',
      back: 'Hello',
    });

    const result = await get_cards_handler.execute({
      user_id: 'user-1',
      deck_id: deck1.id,
    });

    expect(result.length).toBe(1);
    expect(result[0].front).toBe('Hola');
  });

  it('should throw when user does not own the deck', async () => {
    const deck = await create_deck_handler.execute({
      user_id: 'owner',
      name: 'Spanish Basics',
      front_language: 'es',
      back_language: 'en',
    });

    await expect(
      get_cards_handler.execute({
        user_id: 'intruder',
        deck_id: deck.id,
      }),
    ).rejects.toThrow('Deck not found');
  });

  it('should throw when deck does not exist', async () => {
    await expect(
      get_cards_handler.execute({
        user_id: 'user-1',
        deck_id: 'non-existent-deck',
      }),
    ).rejects.toThrow('Deck not found');
  });
});
