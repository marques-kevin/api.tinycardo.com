import { create_testing_module } from '@/tests/create_testing_module';
import { DecksGetDecksHandler } from '@/modules/decks/handlers/decks_get_decks_handler/decks_get_decks_handler';
import { DecksCreateDeckHandler } from '@/modules/decks/handlers/decks_create_deck_handler/decks_create_deck_handler';
import { DecksRepository } from '@/modules/decks/repositories/decks_repository';
import { HistoryRepository } from '@/modules/history/repositories/history_repository';
import { CardsRepository } from '@/modules/cards/repositories/cards_repository';
import { CardsEntity } from '@/modules/cards/entities/cards_entity';

describe('decks_get_decks_handler', () => {
  let get_handler: DecksGetDecksHandler;
  let create_handler: DecksCreateDeckHandler;
  let decks_repository: DecksRepository;
  let history_repository: HistoryRepository;
  let cards_repository: CardsRepository;

  beforeEach(async () => {
    const module = await create_testing_module();
    get_handler = module.get(DecksGetDecksHandler);
    create_handler = module.get(DecksCreateDeckHandler);
    decks_repository = module.get(DecksRepository);
    history_repository = module.get(HistoryRepository);
    cards_repository = module.get(CardsRepository);
  });

  it('should be defined', () => {
    expect(get_handler).toBeDefined();
  });

  it('should return owned decks plus decks from history with stats', async () => {
    const user_id_a = 'user-A';
    const user_id_b = 'user_id_b';

    // Create decks for both users
    const user_a_deck = await create_handler.execute({
      user_id: user_id_a,
      name: 'user_a_deck',
      front_language: 'es',
      back_language: 'en',
      visibility: 'private',
    });

    await decks_repository.save(user_a_deck);

    // Deck for another user
    const user_b_deck = await create_handler.execute({
      user_id: user_id_b,
      name: 'should_be_returned',
      front_language: 'fr',
      back_language: 'en',
      visibility: 'private',
    });

    await create_handler.execute({
      user_id: user_id_b,
      name: 'should_not_be_returned',
      front_language: 'fr',
      back_language: 'en',
      visibility: 'private',
    });

    // prepare cards for both decks
    // user A deck: 2 cards, no history -> ready = 2
    await cards_repository.save({
      id: 'c-a-1',
      deck_id: user_a_deck.id,
      front: 'fa1',
      back: 'ba1',
      created_at: new Date('2023-01-01T00:00:00.000Z'),
      updated_at: new Date('2023-01-01T00:00:00.000Z'),
    } as CardsEntity);
    await cards_repository.save({
      id: 'c-a-2',
      deck_id: user_a_deck.id,
      front: 'fa2',
      back: 'ba2',
      created_at: new Date('2023-01-01T00:00:00.000Z'),
      updated_at: new Date('2023-01-01T00:00:00.000Z'),
    } as CardsEntity);

    // user B deck: 3 cards, 1 history due for user A -> ready = 3 (2 unseen + 1 due)
    await cards_repository.save({
      id: 'c-b-1',
      deck_id: user_b_deck.id,
      front: 'fb1',
      back: 'bb1',
      created_at: new Date('2023-01-01T00:00:00.000Z'),
      updated_at: new Date('2023-01-01T00:00:00.000Z'),
    } as CardsEntity);
    await cards_repository.save({
      id: 'c-b-2',
      deck_id: user_b_deck.id,
      front: 'fb2',
      back: 'bb2',
      created_at: new Date('2023-01-01T00:00:00.000Z'),
      updated_at: new Date('2023-01-01T00:00:00.000Z'),
    } as CardsEntity);
    await cards_repository.save({
      id: 'c-b-3',
      deck_id: user_b_deck.id,
      front: 'fb3',
      back: 'bb3',
      created_at: new Date('2023-01-01T00:00:00.000Z'),
      updated_at: new Date('2023-01-01T00:00:00.000Z'),
    } as CardsEntity);

    // User A has history on B's deck (due in the past)
    await history_repository.save({
      id: 'history-1',
      user_id: user_id_a,
      deck_id: user_b_deck.id,
      card_id: 'c-b-1',
      repetition_count: 0,
      ease_factor: 2.5,
      next_due_at: new Date('2023-01-03T00:00:00.000Z'),
      last_reviewed_at: new Date('2023-01-03T00:00:00.000Z'),
      created_at: new Date('2023-01-03T00:00:00.000Z'),
      updated_at: new Date('2023-01-03T00:00:00.000Z'),
    });

    await decks_repository.save(user_b_deck);

    const result = await get_handler.execute({ user_id: user_id_a });

    expect(result.length).toBe(2);
    const names = result.map((d) => d.name);
    expect(names).toEqual(
      expect.arrayContaining(['should_be_returned', 'user_a_deck']),
    );

    // assert stats
    const deck_a = result.find((d) => d.name === 'user_a_deck')! as any;
    expect(deck_a.number_of_cards).toBe(2);
    expect(deck_a.number_of_cards_ready_to_be_reviewed).toBe(0);
    expect(deck_a.number_of_cards_not_ready_to_be_reviewed).toBe(0);

    const deck_b = result.find((d) => d.name === 'should_be_returned')! as any;
    expect(deck_b.number_of_cards).toBe(3);
    expect(deck_b.number_of_cards_ready_to_be_reviewed).toBe(1);
    expect(deck_b.number_of_cards_not_ready_to_be_reviewed).toBe(0);
  });
});
