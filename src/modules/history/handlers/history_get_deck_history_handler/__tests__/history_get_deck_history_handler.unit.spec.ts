import { create_testing_module } from '@/tests/create_testing_module';
import { HistoryGetDeckHistoryHandler } from '@/modules/history/handlers/history_get_deck_history_handler/history_get_deck_history_handler';
import { DecksCreateDeckHandler } from '@/modules/decks/handlers/decks_create_deck_handler/decks_create_deck_handler';
import { HistoryReviewCardHandler } from '@/modules/history/handlers/history_review_card_handler/history_review_card_handler';
import { CardsRepository } from '@/modules/cards/repositories/cards_repository';
import { v4 } from 'uuid';

describe('history_get_deck_history_handler', () => {
  let handler: HistoryGetDeckHistoryHandler;
  let create_deck_handler: DecksCreateDeckHandler;
  let cards_repository: CardsRepository;

  let review_card_handler: HistoryReviewCardHandler;

  beforeEach(async () => {
    const module = await create_testing_module();
    handler = module.get(HistoryGetDeckHistoryHandler);
    create_deck_handler = module.get(DecksCreateDeckHandler);
    review_card_handler = module.get(HistoryReviewCardHandler);
    cards_repository = module.get(CardsRepository);
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should throw when deck does not exist', async () => {
    await expect(
      handler.execute({
        user_id: 'user-1',
        deck_id: 'non-existent-deck',
      }),
    ).rejects.toThrow('Deck not found');
  });

  it('should throw when user does not own the deck', async () => {
    const deck = await create_deck_handler.execute({
      user_id: 'owner',
      name: 'Spanish Basics',
      front_language: 'es',
      back_language: 'en',
      visibility: 'public',
    });

    await expect(
      handler.execute({
        user_id: 'intruder',
        deck_id: deck.id,
      }),
    ).rejects.toThrow('Deck not found');
  });

  it('should return empty array when deck has no history', async () => {
    const deck = await create_deck_handler.execute({
      user_id: 'user-1',
      name: 'Spanish Basics',
      front_language: 'es',
      back_language: 'en',
      visibility: 'public',
    });

    const result = await handler.execute({
      user_id: 'user-1',
      deck_id: deck.id,
    });

    expect(result).toEqual([]);
  });

  it('should return history records for the deck', async () => {
    const deck = await create_deck_handler.execute({
      user_id: 'user-1',
      name: 'Spanish Basics',
      front_language: 'es',
      back_language: 'en',
      visibility: 'public',
    });

    const card1 = await cards_repository.save({
      id: v4(),
      deck_id: deck.id,
      front: 'Hola',
      back: 'Hello',
      created_at: new Date(),
      updated_at: new Date(),
    });

    const card2 = await cards_repository.save({
      id: v4(),
      deck_id: deck.id,
      front: 'Adiós',
      back: 'Goodbye',
      created_at: new Date(),
      updated_at: new Date(),
    });

    await review_card_handler.execute({
      user_id: 'user-1',
      card_id: card1.id,
      status: 'known',
    });

    await review_card_handler.execute({
      user_id: 'user-1',
      card_id: card2.id,
      status: 'unknown',
    });

    const result = await handler.execute({
      user_id: 'user-1',
      deck_id: deck.id,
    });

    expect(result).toHaveLength(2);
    expect(result[0].deck_id).toBe(deck.id);
    expect(result[1].deck_id).toBe(deck.id);
    expect(result.some((h) => h.card_id === card1.id)).toBe(true);
    expect(result.some((h) => h.card_id === card2.id)).toBe(true);
  });

  it('should return history ordered by last_reviewed_at descending', async () => {
    const deck = await create_deck_handler.execute({
      user_id: 'user-1',
      name: 'Spanish Basics',
      front_language: 'es',
      back_language: 'en',
      visibility: 'public',
      description: 'Spanish Basics',
    });

    const card1 = await cards_repository.save({
      id: v4(),
      deck_id: deck.id,
      front: 'Hola',
      back: 'Hello',
      created_at: new Date(),
      updated_at: new Date(),
    });

    const card2 = await cards_repository.save({
      id: v4(),
      deck_id: deck.id,
      front: 'Adiós',
      back: 'Goodbye',
      created_at: new Date(),
      updated_at: new Date(),
    });

    // Review card1 first, then card2
    await review_card_handler.execute({
      user_id: 'user-1',
      card_id: card1.id,
      status: 'known',
    });

    // Small delay to ensure different timestamps
    await new Promise((resolve) => setTimeout(resolve, 10));

    await review_card_handler.execute({
      user_id: 'user-1',
      card_id: card2.id,
      status: 'known',
    });

    const result = await handler.execute({
      user_id: 'user-1',
      deck_id: deck.id,
    });

    expect(result).toHaveLength(2);
    // Most recent first (card2 was reviewed last)
    expect(result[0].card_id).toBe(card2.id);
    expect(result[1].card_id).toBe(card1.id);
  });

  it('should only return history for the specified deck', async () => {
    const deck1 = await create_deck_handler.execute({
      user_id: 'user-1',
      name: 'Spanish Basics',
      front_language: 'es',
      back_language: 'en',
      visibility: 'public',
    });

    const deck2 = await create_deck_handler.execute({
      user_id: 'user-1',
      name: 'French Basics',
      front_language: 'fr',
      back_language: 'en',
      visibility: 'public',
    });

    const card1 = await cards_repository.save({
      id: v4(),
      created_at: new Date(),
      updated_at: new Date(),
      deck_id: deck1.id,
      front: 'Hola',
      back: 'Hello',
    });

    const card2 = await cards_repository.save({
      id: v4(),
      created_at: new Date(),
      updated_at: new Date(),
      deck_id: deck2.id,
      front: 'Bonjour',
      back: 'Hello',
    });

    // Review both cards
    await review_card_handler.execute({
      user_id: 'user-1',
      card_id: card1.id,
      status: 'known',
    });

    await review_card_handler.execute({
      user_id: 'user-1',
      card_id: card2.id,
      status: 'known',
    });

    const result = await handler.execute({
      user_id: 'user-1',
      deck_id: deck1.id,
    });

    expect(result).toHaveLength(1);
    expect(result[0].deck_id).toBe(deck1.id);
    expect(result[0].card_id).toBe(card1.id);
  });

  it('should only return history for the specified user', async () => {
    const deck = await create_deck_handler.execute({
      user_id: 'user-1',
      name: 'Spanish Basics',
      front_language: 'es',
      back_language: 'en',
      visibility: 'public',
    });

    const card = await cards_repository.save({
      id: v4(),
      created_at: new Date(),
      updated_at: new Date(),
      deck_id: deck.id,
      front: 'Hola',
      back: 'Hello',
    });

    // Review the card
    await review_card_handler.execute({
      user_id: 'user-1',
      card_id: card.id,
      status: 'known',
    });

    const result = await handler.execute({
      user_id: 'user-1',
      deck_id: deck.id,
    });

    expect(result).toHaveLength(1);
    expect(result[0].user_id).toBe('user-1');
  });
});
