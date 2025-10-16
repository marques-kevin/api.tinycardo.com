import { create_testing_module } from '@/tests/create_testing_module';
import { CardsUpdateCardHandler } from '@/modules/cards/handlers/cards_update_card_handler/cards_update_card_handler';
import { CardsCreateCardHandler } from '@/modules/cards/handlers/cards_create_card_handler/cards_create_card_handler';
import { DecksCreateDeckHandler } from '@/modules/decks/handlers/decks_create_deck_handler/decks_create_deck_handler';
import { CardsRepository } from '@/modules/cards/repositories/cards_repository';

describe('cards_update_card_handler', () => {
  let update_card_handler: CardsUpdateCardHandler;
  let create_card_handler: CardsCreateCardHandler;
  let create_deck_handler: DecksCreateDeckHandler;
  let cards_repository: CardsRepository;

  beforeEach(async () => {
    const module = await create_testing_module();
    update_card_handler = module.get(CardsUpdateCardHandler);
    create_card_handler = module.get(CardsCreateCardHandler);
    create_deck_handler = module.get(DecksCreateDeckHandler);
    cards_repository = module.get(CardsRepository);
  });

  it('should be defined', () => {
    expect(update_card_handler).toBeDefined();
  });

  it('should update card fields', async () => {
    const deck = await create_deck_handler.execute({
      user_id: 'user-1',
      name: 'Spanish Basics',
      front_language: 'es',
      back_language: 'en',
    });

    const card = await create_card_handler.execute({
      user_id: 'user-1',
      deck_id: deck.id,
      front: 'Hola',
      back: 'Hello',
    });

    const updated = await update_card_handler.execute({
      user_id: 'user-1',
      card_id: card.id,
      front: 'Buenos días',
      back: 'Good morning',
    });

    expect(updated.id).toBe(card.id);
    expect(updated.deck_id).toBe(deck.id);
    expect(updated.front).toBe('Buenos días');
    expect(updated.back).toBe('Good morning');

    const saved = await cards_repository.find_by_id(card.id);
    expect(saved).toEqual(updated);
  });

  it('should update only front field', async () => {
    const deck = await create_deck_handler.execute({
      user_id: 'user-1',
      name: 'Spanish Basics',
      front_language: 'es',
      back_language: 'en',
    });

    const card = await create_card_handler.execute({
      user_id: 'user-1',
      deck_id: deck.id,
      front: 'Hola',
      back: 'Hello',
    });

    const updated = await update_card_handler.execute({
      user_id: 'user-1',
      card_id: card.id,
      front: 'Buenos días',
    });

    expect(updated.front).toBe('Buenos días');
    expect(updated.back).toBe('Hello');
  });

  it('should update only back field', async () => {
    const deck = await create_deck_handler.execute({
      user_id: 'user-1',
      name: 'Spanish Basics',
      front_language: 'es',
      back_language: 'en',
    });

    const card = await create_card_handler.execute({
      user_id: 'user-1',
      deck_id: deck.id,
      front: 'Hola',
      back: 'Hello',
    });

    const updated = await update_card_handler.execute({
      user_id: 'user-1',
      card_id: card.id,
      back: 'Hi',
    });

    expect(updated.front).toBe('Hola');
    expect(updated.back).toBe('Hi');
  });

  it('should throw when user does not own the deck', async () => {
    const deck = await create_deck_handler.execute({
      user_id: 'owner',
      name: 'Spanish Basics',
      front_language: 'es',
      back_language: 'en',
    });

    const card = await create_card_handler.execute({
      user_id: 'owner',
      deck_id: deck.id,
      front: 'Hola',
      back: 'Hello',
    });

    await expect(
      update_card_handler.execute({
        user_id: 'intruder',
        card_id: card.id,
        front: 'Hacked',
      }),
    ).rejects.toThrow('Card not found');
  });

  it('should throw when card does not exist', async () => {
    await expect(
      update_card_handler.execute({
        user_id: 'user-1',
        card_id: 'non-existent-card',
        front: 'Hola',
      }),
    ).rejects.toThrow('Card not found');
  });
});
