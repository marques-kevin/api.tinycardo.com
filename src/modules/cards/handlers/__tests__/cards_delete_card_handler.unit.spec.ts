import { create_testing_module } from '@/tests/create_testing_module';
import { CardsDeleteCardHandler } from '@/modules/cards/handlers/cards_delete_card_handler';
import { CardsCreateCardHandler } from '@/modules/cards/handlers/cards_create_card_handler';
import { DecksCreateDeckHandler } from '@/modules/decks/handlers/decks_create_deck_handler';
import { CardsRepository } from '@/modules/cards/repositories/cards_repository';

describe('cards_delete_card_handler', () => {
  let delete_card_handler: CardsDeleteCardHandler;
  let create_card_handler: CardsCreateCardHandler;
  let create_deck_handler: DecksCreateDeckHandler;
  let cards_repository: CardsRepository;

  beforeEach(async () => {
    const module = await create_testing_module();
    delete_card_handler = module.get(CardsDeleteCardHandler);
    create_card_handler = module.get(CardsCreateCardHandler);
    create_deck_handler = module.get(DecksCreateDeckHandler);
    cards_repository = module.get(CardsRepository);
  });

  it('should be defined', () => {
    expect(delete_card_handler).toBeDefined();
  });

  it('should delete a card', async () => {
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

    await delete_card_handler.execute({
      user_id: 'user-1',
      card_id: card.id,
    });

    const deleted = await cards_repository.find_by_id(card.id);
    expect(deleted).toBeNull();
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
      delete_card_handler.execute({
        user_id: 'intruder',
        card_id: card.id,
      }),
    ).rejects.toThrow('Card not found');

    const still_exists = await cards_repository.find_by_id(card.id);
    expect(still_exists).toBeDefined();
  });

  it('should throw when card does not exist', async () => {
    await expect(
      delete_card_handler.execute({
        user_id: 'user-1',
        card_id: 'non-existent-card',
      }),
    ).rejects.toThrow('Card not found');
  });
});
