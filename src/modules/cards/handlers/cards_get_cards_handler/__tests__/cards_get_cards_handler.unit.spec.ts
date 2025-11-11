import { create_testing_module } from '@/tests/create_testing_module';
import { CardsGetCardsHandler } from '@/modules/cards/handlers/cards_get_cards_handler/cards_get_cards_handler';
import { CardsRepository } from '@/modules/cards/repositories/cards_repository';
import { DecksRepository } from '@/modules/decks/repositories/decks_repository';
import { v4 } from 'uuid';
import { LessonsRepository } from '@/modules/lessons/repositories/lessons_repository';

describe('cards_get_cards_handler', () => {
  let get_cards_handler: CardsGetCardsHandler;
  let cards_repository: CardsRepository;
  let decks_repository: DecksRepository;
  let lessons_repository: LessonsRepository;

  beforeEach(async () => {
    const module = await create_testing_module();
    get_cards_handler = module.get(CardsGetCardsHandler);
    cards_repository = module.get(CardsRepository);
    decks_repository = module.get(DecksRepository);
    lessons_repository = module.get(LessonsRepository);
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
    const { cards } = await get_cards_handler.execute({
      user_id: 'user-1',
      deck_id: deck.id,
    });

    expect(cards.length).toBe(3);
    expect(cards[0].front).toBe('Hola');
    expect(cards[1].front).toBe('Adiós');
    expect(cards[2].front).toBe('Gracias');
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

    const { cards } = await get_cards_handler.execute({
      user_id: 'user-1',
      deck_id: deck.id,
    });

    expect(cards.length).toBe(0);
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

    const { cards } = await get_cards_handler.execute({
      user_id: 'user-1',
      deck_id: deck1.id,
    });

    expect(cards.length).toBe(1);
    expect(cards[0].front).toBe('Hola');
  });

  it('should throw when deck does not exist', async () => {
    await expect(
      get_cards_handler.execute({
        user_id: 'user-1',
        deck_id: 'non-existent-deck',
      }),
    ).rejects.toThrow('Deck not found');
  });

  it('should return cards ordered by lesson position', async () => {
    const deck = await decks_repository.save({
      id: v4(),
      user_id: 'user-1',
      name: 'Spanish Basics',
      front_language: 'es',
      back_language: 'en',
      visibility: 'public',
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: null,
      description: 'Spanish Basics',
    });

    await cards_repository.save({
      id: 'deck_card_1',
      deck_id: deck.id,
      front: 'Hola',
      back: 'Hello',
      created_at: new Date(),
      updated_at: new Date(),
    });

    await cards_repository.save({
      id: 'deck_card_2',
      deck_id: deck.id,
      front: 'Adiós',
      back: 'Goodbye',
      created_at: new Date(),
      updated_at: new Date(),
    });

    await cards_repository.save({
      id: 'card_without_lesson',
      deck_id: deck.id,
      front: 'Without Lesson',
      back: 'Without Lesson',
      created_at: new Date('1999-01-01'),
      updated_at: new Date(),
    });

    await lessons_repository.save({
      id: 'lesson_1',
      deck_id: deck.id,
      name: 'Lesson 1',
      position: 0,
      cards: ['deck_card_2'],
      created_at: new Date(),
      updated_at: new Date(),
    });

    await lessons_repository.save({
      id: 'lesson_2',
      deck_id: deck.id,
      name: 'Lesson 2',
      position: 1,
      cards: ['deck_card_1'],
      created_at: new Date(),
      updated_at: new Date(),
    });

    const { cards } = await get_cards_handler.execute({
      user_id: 'user-1',
      deck_id: deck.id,
    });

    expect(cards.length).toBe(3);
    expect(cards[0].id).toBe('deck_card_2');
    expect(cards[1].id).toBe('deck_card_1');
    expect(cards[2].id).toBe('card_without_lesson');
  });
});
