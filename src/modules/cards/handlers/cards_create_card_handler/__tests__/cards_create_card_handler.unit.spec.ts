import { create_testing_module } from '@/tests/create_testing_module';
import { CardsCreateCardHandler } from '@/modules/cards/handlers/cards_create_card_handler/cards_create_card_handler';
import { DecksCreateDeckHandler } from '@/modules/decks/handlers/decks_create_deck_handler/decks_create_deck_handler';
import { CardsRepository } from '@/modules/cards/repositories/cards_repository';

describe('cards_create_card_handler', () => {
  let create_card_handler: CardsCreateCardHandler;
  let create_deck_handler: DecksCreateDeckHandler;
  let cards_repository: CardsRepository;

  beforeEach(async () => {
    const module = await create_testing_module();
    create_card_handler = module.get(CardsCreateCardHandler);
    create_deck_handler = module.get(DecksCreateDeckHandler);
    cards_repository = module.get(CardsRepository);
  });

  it('should be defined', () => {
    expect(create_card_handler).toBeDefined();
  });

  it('should create and persist a card', async () => {
    const deck = await create_deck_handler.execute({
      user_id: 'user-1',
      name: 'Spanish Basics',
      front_language: 'es',
      back_language: 'en',
    });

    const result = await create_card_handler.execute({
      user_id: 'user-1',
      deck_id: deck.id,
      front: 'Hola',
      back: 'Hello',
    });

    expect(result).toBeDefined();
    expect(result.id).toBeDefined();
    expect(result.deck_id).toBe(deck.id);
    expect(result.front).toBe('Hola');
    expect(result.back).toBe('Hello');
    expect(result.created_at).toBeDefined();
    expect(result.updated_at).toBeDefined();

    const saved = await cards_repository.find_by_id(result.id);
    expect(saved).toEqual(result);
  });

  it('should throw when user does not own the deck', async () => {
    const deck = await create_deck_handler.execute({
      user_id: 'owner',
      name: 'Spanish Basics',
      front_language: 'es',
      back_language: 'en',
    });

    await expect(
      create_card_handler.execute({
        user_id: 'intruder',
        deck_id: deck.id,
        front: 'Hola',
        back: 'Hello',
      }),
    ).rejects.toThrow('Deck not found');
  });

  it('should throw when deck does not exist', async () => {
    await expect(
      create_card_handler.execute({
        user_id: 'user-1',
        deck_id: 'non-existent-deck',
        front: 'Hola',
        back: 'Hello',
      }),
    ).rejects.toThrow('Deck not found');
  });
});
