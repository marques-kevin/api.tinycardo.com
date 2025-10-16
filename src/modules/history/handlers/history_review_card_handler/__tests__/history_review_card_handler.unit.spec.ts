import { create_testing_module } from '@/tests/create_testing_module';
import { HistoryReviewCardHandler } from '@/modules/history/handlers/history_review_card_handler/history_review_card_handler';
import { HistoryRepository } from '@/modules/history/repositories/history_repository';
import { DecksCreateDeckHandler } from '@/modules/decks/handlers/decks_create_deck_handler/decks_create_deck_handler';
import { CardsCreateCardHandler } from '@/modules/cards/handlers/cards_create_card_handler/cards_create_card_handler';
import {
  BASE_EASE_FACTOR,
  MIN_EASE_FACTOR,
  MAX_EASE_FACTOR,
} from '@/modules/history/utils/history_due_date_algorithm';

describe('history_review_card_handler', () => {
  let handler: HistoryReviewCardHandler;
  let history_repository: HistoryRepository;
  let create_deck_handler: DecksCreateDeckHandler;
  let create_card_handler: CardsCreateCardHandler;

  beforeEach(async () => {
    const module = await create_testing_module();
    handler = module.get(HistoryReviewCardHandler);
    history_repository = module.get(HistoryRepository);
    create_deck_handler = module.get(DecksCreateDeckHandler);
    create_card_handler = module.get(CardsCreateCardHandler);
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should throw when card does not exist', async () => {
    await expect(
      handler.execute({
        user_id: 'user-1',
        card_id: 'non-existent-card',
        status: 'known',
      }),
    ).rejects.toThrow('Card not found');
  });

  describe('first review', () => {
    it('should create history record when reviewing a card for the first time with "known"', async () => {
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

      const before = new Date();
      const result = await handler.execute({
        user_id: 'user-1',
        card_id: card.id,
        status: 'known',
      });
      const after = new Date();

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.card_id).toBe(card.id);
      expect(result.deck_id).toBe(deck.id);
      expect(result.repetition_count).toBe(1);
      expect(result.ease_factor).toBe(BASE_EASE_FACTOR + 0.1);

      // Should schedule for 1 day later (first success)
      const expected_next_due = new Date(
        before.getTime() + 24 * 60 * 60 * 1000,
      );
      expect(result.next_due_at.getTime()).toBeGreaterThanOrEqual(
        expected_next_due.getTime() - 1000,
      );
      expect(result.next_due_at.getTime()).toBeLessThanOrEqual(
        new Date(after.getTime() + 24 * 60 * 60 * 1000).getTime() + 1000,
      );

      expect(result.last_reviewed_at.getTime()).toBeGreaterThanOrEqual(
        before.getTime() - 1000,
      );
      expect(result.last_reviewed_at.getTime()).toBeLessThanOrEqual(
        after.getTime() + 1000,
      );
    });

    it('should create history record when reviewing a card for the first time with "unknown"', async () => {
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

      const before = new Date();
      const result = await handler.execute({
        user_id: 'user-1',
        card_id: card.id,
        status: 'unknown',
      });
      const after = new Date();

      expect(result).toBeDefined();
      expect(result.card_id).toBe(card.id);
      expect(result.repetition_count).toBe(0);
      expect(result.ease_factor).toBe(BASE_EASE_FACTOR - 0.2);

      // Should schedule for immediate review (today)
      expect(result.next_due_at.getTime()).toBeGreaterThanOrEqual(
        before.getTime() - 1000,
      );
      expect(result.next_due_at.getTime()).toBeLessThanOrEqual(
        after.getTime() + 1000,
      );
    });
  });

  describe('subsequent reviews', () => {
    it('should update history when marking card as "known" multiple times', async () => {
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

      // First review - known
      const first_review = await handler.execute({
        user_id: 'user-1',
        card_id: card.id,
        status: 'known',
      });

      expect(first_review.repetition_count).toBe(1);
      expect(first_review.ease_factor).toBeCloseTo(BASE_EASE_FACTOR + 0.1, 10);

      // Second review - known
      const second_review = await handler.execute({
        user_id: 'user-1',
        card_id: card.id,
        status: 'known',
      });

      expect(second_review.repetition_count).toBe(2);
      expect(second_review.ease_factor).toBeCloseTo(BASE_EASE_FACTOR + 0.2, 10);

      // Should schedule for 6 days later (second success)
      const expected_interval = 6 * 24 * 60 * 60 * 1000;
      const time_diff =
        second_review.next_due_at.getTime() -
        second_review.last_reviewed_at.getTime();
      expect(time_diff).toBeGreaterThanOrEqual(expected_interval - 1000);
      expect(time_diff).toBeLessThanOrEqual(expected_interval + 1000);

      // Third review - known
      const third_review = await handler.execute({
        user_id: 'user-1',
        card_id: card.id,
        status: 'known',
      });

      expect(third_review.repetition_count).toBe(3);
      expect(third_review.ease_factor).toBeCloseTo(BASE_EASE_FACTOR + 0.3, 10);

      // After second success, interval should be multiplied by ease factor
      // Previous interval was 6 days, ease factor is now 2.8
      // Expected: ~17 days (6 * 2.8 = 16.8, rounded to 17)
      const third_interval =
        third_review.next_due_at.getTime() -
        third_review.last_reviewed_at.getTime();
      const expected_third_interval = Math.round(6 * (BASE_EASE_FACTOR + 0.3));
      expect(third_interval / (24 * 60 * 60 * 1000)).toBeCloseTo(
        expected_third_interval,
        0,
      );
    });

    it('should reset streak when marking card as "unknown"', async () => {
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

      // First review - known
      const first_review = await handler.execute({
        user_id: 'user-1',
        card_id: card.id,
        status: 'known',
      });

      expect(first_review.repetition_count).toBe(1);
      const first_ease_factor = first_review.ease_factor;

      // Second review - unknown (should reset)
      const second_review = await handler.execute({
        user_id: 'user-1',
        card_id: card.id,
        status: 'unknown',
      });

      expect(second_review.repetition_count).toBe(0);
      expect(second_review.ease_factor).toBe(first_ease_factor - 0.2);

      // Should schedule for immediate review
      const time_diff =
        second_review.next_due_at.getTime() -
        second_review.last_reviewed_at.getTime();
      expect(Math.abs(time_diff)).toBeLessThan(1000);
    });

    it('should not decrease ease factor below minimum', async () => {
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

      // Create a history record with ease factor close to minimum
      const histories = await history_repository.find_all({
        where: { card_id: card.id },
      });
      const history = histories[0] || {
        id: 'test-history',
        user_id: 'user-1',
        card_id: card.id,
        deck_id: deck.id,
        repetition_count: 1,
        ease_factor: MIN_EASE_FACTOR + 0.1,
        next_due_at: new Date(),
        last_reviewed_at: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
      };
      await history_repository.save(history);

      // Review as unknown multiple times
      const review1 = await handler.execute({
        user_id: 'user-1',
        card_id: card.id,
        status: 'unknown',
      });

      expect(review1.ease_factor).toBe(MIN_EASE_FACTOR);

      const review2 = await handler.execute({
        user_id: 'user-1',
        card_id: card.id,
        status: 'unknown',
      });

      // Should stay at minimum
      expect(review2.ease_factor).toBe(MIN_EASE_FACTOR);
    });

    it('should not increase ease factor above maximum', async () => {
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

      // Create a history record with ease factor close to maximum
      const history = {
        id: 'test-history',
        user_id: 'user-1',
        card_id: card.id,
        deck_id: deck.id,
        repetition_count: 5,
        ease_factor: MAX_EASE_FACTOR - 0.05,
        next_due_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        last_reviewed_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        created_at: new Date(),
        updated_at: new Date(),
      };
      await history_repository.save(history);

      // Review as known multiple times
      const review1 = await handler.execute({
        user_id: 'user-1',
        card_id: card.id,
        status: 'known',
      });

      expect(review1.ease_factor).toBe(MAX_EASE_FACTOR);

      const review2 = await handler.execute({
        user_id: 'user-1',
        card_id: card.id,
        status: 'known',
      });

      // Should stay at maximum
      expect(review2.ease_factor).toBe(MAX_EASE_FACTOR);
    });
  });

  describe('persistence', () => {
    it('should persist the updated history to the repository', async () => {
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

      const result = await handler.execute({
        user_id: 'user-1',
        card_id: card.id,
        status: 'known',
      });

      const saved = await history_repository.find_by_id(result.id);
      expect(saved).toEqual(result);

      // Verify it can be found by card_id
      const histories = await history_repository.find_all({
        where: { card_id: card.id },
      });
      expect(histories.length).toBe(1);
      expect(histories[0].id).toBe(result.id);
    });

    it('should update the same history record on subsequent reviews', async () => {
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

      const first_review = await handler.execute({
        user_id: 'user-1',
        card_id: card.id,
        status: 'known',
      });

      const second_review = await handler.execute({
        user_id: 'user-1',
        card_id: card.id,
        status: 'known',
      });

      // Should be the same history record
      expect(second_review.id).toBe(first_review.id);

      // Should only have one history record for this card
      const histories = await history_repository.find_all({
        where: { card_id: card.id },
      });
      expect(histories.length).toBe(1);
    });
  });
});
