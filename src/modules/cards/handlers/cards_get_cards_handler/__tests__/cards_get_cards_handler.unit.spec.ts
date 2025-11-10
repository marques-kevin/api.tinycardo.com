import { create_testing_module } from '@/tests/create_testing_module';
import { CardsGetCardsHandler } from '@/modules/cards/handlers/cards_get_cards_handler/cards_get_cards_handler';
import { CardsRepository } from '@/modules/cards/repositories/cards_repository';
import { DecksRepository } from '@/modules/decks/repositories/decks_repository';
import { v4 } from 'uuid';

describe('cards_get_cards_handler', () => {
  let get_cards_handler: CardsGetCardsHandler;
  let cards_repository: CardsRepository;
  let decks_repository: DecksRepository;

  beforeEach(async () => {
    const module = await create_testing_module();
    get_cards_handler = module.get(CardsGetCardsHandler);
    cards_repository = module.get(CardsRepository);
    decks_repository = module.get(DecksRepository);
  });

  it('should be defined', () => {
    expect(get_cards_handler).toBeDefined();
  });

  it('should get all cards for a deck', async () => {
    const deck = await decks_repository.save({
      user_id: 'user-1',
      name: 'Spanish Basics',
      front_language: 'es',
      back_language: 'en',
      visibility: 'public',
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: null,
      description: 'Spanish Basics',
      id: v4(),
    });

    await cards_repository.save({
      id: v4(),
      deck_id: deck.id,
      front: 'Hola',
      back: 'Hello',
      created_at: new Date(),
      updated_at: new Date(),
    });

    await cards_repository.save({
      id: v4(),
      deck_id: deck.id,
      front: 'Adiós',
      back: 'Goodbye',
      created_at: new Date(),
      updated_at: new Date(),
    });

    await cards_repository.save({
      id: v4(),
      deck_id: deck.id,
      front: 'Gracias',
      back: 'Thank you',
      created_at: new Date(),
      updated_at: new Date(),
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
    const deck = await decks_repository.save({
      id: v4(),
      user_id: 'user-1',
      name: 'Empty Deck',
      front_language: 'es',
      back_language: 'en',
      visibility: 'public',
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: null,
      description: 'Empty Deck',
    });

    const result = await get_cards_handler.execute({
      user_id: 'user-1',
      deck_id: deck.id,
    });

    expect(result.length).toBe(0);
  });

  it('should only return cards for the specified deck', async () => {
    const deck1 = await decks_repository.save({
      user_id: 'user-1',
      name: 'Spanish Basics',
      front_language: 'es',
      back_language: 'en',
      visibility: 'public',
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: null,
      description: 'Spanish Basics',
      id: v4(),
    });

    const deck2 = await decks_repository.save({
      user_id: 'user-1',
      name: 'French Basics',
      front_language: 'fr',
      back_language: 'en',
      visibility: 'public',
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: null,
      description: 'French Basics',
      id: v4(),
    });

    await cards_repository.save({
      id: v4(),
      deck_id: deck1.id,
      front: 'Hola',
      back: 'Hello',
      created_at: new Date(),
      updated_at: new Date(),
    });

    await cards_repository.save({
      id: v4(),
      deck_id: deck2.id,
      front: 'Bonjour',
      back: 'Hello',
      created_at: new Date(),
      updated_at: new Date(),
    });

    const result = await get_cards_handler.execute({
      user_id: 'user-1',
      deck_id: deck1.id,
    });

    expect(result.length).toBe(1);
    expect(result[0].front).toBe('Hola');
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
