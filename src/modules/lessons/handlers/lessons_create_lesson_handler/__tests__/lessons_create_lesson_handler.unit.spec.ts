import { create_testing_module } from '@/tests/create_testing_module';
import { LessonsCreateLessonHandler } from '@/modules/lessons/handlers/lessons_create_lesson_handler/lessons_create_lesson_handler';
import { LessonsRepository } from '@/modules/lessons/repositories/lessons_repository';
import { DecksCreateDeckHandler } from '@/modules/decks/handlers/decks_create_deck_handler/decks_create_deck_handler';

describe('lessons_create_lesson_handler', () => {
  let handler: LessonsCreateLessonHandler;
  let lessons_repository: LessonsRepository;
  let create_deck_handler: DecksCreateDeckHandler;

  beforeEach(async () => {
    const module = await create_testing_module();
    handler = module.get(LessonsCreateLessonHandler);
    lessons_repository = module.get(LessonsRepository);
    create_deck_handler = module.get(DecksCreateDeckHandler);
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should create and persist a lesson', async () => {
    const user_id = 'user-1';
    const deck = await create_deck_handler.execute({
      user_id,
      name: 'Spanish Basics',
      front_language: 'es',
      back_language: 'en',
      visibility: 'private',
    });

    const result = await handler.execute({
      user_id,
      name: 'Lesson 1',
      deck_id: deck.id,
      position: 0,
      cards: ['card-1', 'card-2'],
    });

    expect(result).toBeDefined();
    expect(result.id).toBeDefined();
    expect(result.name).toBe('Lesson 1');
    expect(result.deck_id).toBe(deck.id);
    expect(result.position).toBe(0);
    expect(result.cards).toEqual(['card-1', 'card-2']);

    const saved = await lessons_repository.find_all({
      where: { deck_id: deck.id },
    });
    expect(saved.length).toBe(1);
    expect(saved[0]).toEqual(
      expect.objectContaining({
        name: 'Lesson 1',
        deck_id: deck.id,
        position: 0,
        cards: ['card-1', 'card-2'],
      }),
    );
  });

  it('should create a lesson with empty cards array', async () => {
    const user_id = 'user-1';
    const deck = await create_deck_handler.execute({
      user_id,
      name: 'French Basics',
      front_language: 'fr',
      back_language: 'en',
      visibility: 'private',
    });

    const result = await handler.execute({
      user_id,
      name: 'Empty Lesson',
      deck_id: deck.id,
      position: 1,
      cards: [],
    });

    expect(result.cards).toEqual([]);
  });

  it('should throw NotFoundException when deck does not exist', async () => {
    await expect(
      handler.execute({
        user_id: 'user-1',
        name: 'Lesson 1',
        deck_id: 'non-existent-deck-id',
        position: 0,
        cards: [],
      }),
    ).rejects.toThrow('Deck not found');
  });

  it('should throw ForbiddenException when user does not own the deck', async () => {
    const owner_id = 'owner';
    const deck = await create_deck_handler.execute({
      user_id: owner_id,
      name: 'Owner Deck',
      front_language: 'es',
      back_language: 'en',
      visibility: 'private',
    });

    await expect(
      handler.execute({
        user_id: 'intruder',
        name: 'Lesson 1',
        deck_id: deck.id,
        position: 0,
        cards: [],
      }),
    ).rejects.toThrow('Access denied: You must be the owner of this deck');
  });
});
