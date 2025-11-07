import { create_testing_module } from '@/tests/create_testing_module';
import { LessonsReorderLessonsHandler } from '@/modules/lessons/handlers/lessons_reorder_lessons_handler/lessons_reorder_lessons_handler';
import { LessonsRepository } from '@/modules/lessons/repositories/lessons_repository';
import { DecksRepository } from '@/modules/decks/repositories/decks_repository';
import { DecksCreateDeckHandler } from '@/modules/decks/handlers/decks_create_deck_handler/decks_create_deck_handler';
import { LessonsCreateLessonHandler } from '@/modules/lessons/handlers/lessons_create_lesson_handler/lessons_create_lesson_handler';

describe('lessons_reorder_lessons_handler', () => {
  let handler: LessonsReorderLessonsHandler;
  let create_lesson_handler: LessonsCreateLessonHandler;
  let create_deck_handler: DecksCreateDeckHandler;
  let lessons_repository: LessonsRepository;
  let decks_repository: DecksRepository;

  beforeEach(async () => {
    const module = await create_testing_module();
    handler = module.get(LessonsReorderLessonsHandler);
    create_lesson_handler = module.get(LessonsCreateLessonHandler);
    create_deck_handler = module.get(DecksCreateDeckHandler);
    lessons_repository = module.get(LessonsRepository);
    decks_repository = module.get(DecksRepository);
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should reorder lessons in a deck', async () => {
    const user_id = 'user-1';
    const deck = await create_deck_handler.execute({
      user_id,
      name: 'Spanish Basics',
      front_language: 'es',
      back_language: 'en',
      visibility: 'private',
    });

    const lesson1 = await create_lesson_handler.execute({
      user_id,
      name: 'Lesson 1',
      deck_id: deck.id,
      position: 0,
      cards: [],
    });

    const lesson2 = await create_lesson_handler.execute({
      user_id,
      name: 'Lesson 2',
      deck_id: deck.id,
      position: 1,
      cards: [],
    });

    const lesson3 = await create_lesson_handler.execute({
      user_id,
      name: 'Lesson 3',
      deck_id: deck.id,
      position: 2,
      cards: [],
    });

    // Reorder: lesson3 -> position 0, lesson1 -> position 1, lesson2 -> position 2
    const result = await handler.execute({
      user_id,
      deck_id: deck.id,
      reorder_data: [
        { lesson_id: lesson3.id, position: 0 },
        { lesson_id: lesson1.id, position: 1 },
        { lesson_id: lesson2.id, position: 2 },
      ],
    });

    expect(result.lessons.length).toBe(3);
    expect(result.lessons.map((l) => l.id)).toEqual(
      expect.arrayContaining([lesson1.id, lesson2.id, lesson3.id]),
    );
    expect(result.lessons.map((l) => l.position)).toEqual([0, 1, 2]);

    const updated_lesson1 = await lessons_repository.find_by_id(lesson1.id);
    const updated_lesson2 = await lessons_repository.find_by_id(lesson2.id);
    const updated_lesson3 = await lessons_repository.find_by_id(lesson3.id);

    expect(updated_lesson1?.position).toBe(1);
    expect(updated_lesson2?.position).toBe(2);
    expect(updated_lesson3?.position).toBe(0);
  });

  it('should throw NotFoundException when deck does not exist', async () => {
    await expect(
      handler.execute({
        user_id: 'user-1',
        deck_id: 'non-existent-deck-id',
        reorder_data: [{ lesson_id: 'lesson-1', position: 0 }],
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

    const lesson = await create_lesson_handler.execute({
      user_id: owner_id,
      name: 'Lesson',
      deck_id: deck.id,
      position: 0,
      cards: [],
    });

    await expect(
      handler.execute({
        user_id: 'intruder',
        deck_id: deck.id,
        reorder_data: [{ lesson_id: lesson.id, position: 0 }],
      }),
    ).rejects.toThrow(
      'Access denied: You can only reorder lessons in your own decks',
    );
  });

  it('should throw BadRequestException when lesson does not belong to deck', async () => {
    const user_id = 'user-1';
    const deck1 = await create_deck_handler.execute({
      user_id,
      name: 'Deck 1',
      front_language: 'es',
      back_language: 'en',
      visibility: 'private',
    });

    const deck2 = await create_deck_handler.execute({
      user_id,
      name: 'Deck 2',
      front_language: 'fr',
      back_language: 'en',
      visibility: 'private',
    });

    const lesson_in_deck2 = await create_lesson_handler.execute({
      user_id,
      name: 'Lesson in Deck 2',
      deck_id: deck2.id,
      position: 0,
      cards: [],
    });

    await expect(
      handler.execute({
        user_id,
        deck_id: deck1.id,
        reorder_data: [{ lesson_id: lesson_in_deck2.id, position: 0 }],
      }),
    ).rejects.toThrow('Lessons not found in deck');
  });

  it('should throw BadRequestException when not all lessons are included', async () => {
    const user_id = 'user-1';
    const deck = await create_deck_handler.execute({
      user_id,
      name: 'Deck',
      front_language: 'es',
      back_language: 'en',
      visibility: 'private',
    });

    const lesson1 = await create_lesson_handler.execute({
      user_id,
      name: 'Lesson 1',
      deck_id: deck.id,
      position: 0,
      cards: [],
    });

    const lesson2 = await create_lesson_handler.execute({
      user_id,
      name: 'Lesson 2',
      deck_id: deck.id,
      position: 1,
      cards: [],
    });

    await expect(
      handler.execute({
        user_id,
        deck_id: deck.id,
        reorder_data: [{ lesson_id: lesson1.id, position: 0 }],
      }),
    ).rejects.toThrow('All lessons must be included in reorder_data');
  });

  it('should throw BadRequestException when positions are not unique', async () => {
    const user_id = 'user-1';
    const deck = await create_deck_handler.execute({
      user_id,
      name: 'Deck',
      front_language: 'es',
      back_language: 'en',
      visibility: 'private',
    });

    const lesson1 = await create_lesson_handler.execute({
      user_id,
      name: 'Lesson 1',
      deck_id: deck.id,
      position: 0,
      cards: [],
    });

    const lesson2 = await create_lesson_handler.execute({
      user_id,
      name: 'Lesson 2',
      deck_id: deck.id,
      position: 1,
      cards: [],
    });

    await expect(
      handler.execute({
        user_id,
        deck_id: deck.id,
        reorder_data: [
          { lesson_id: lesson1.id, position: 0 },
          { lesson_id: lesson2.id, position: 0 },
        ],
      }),
    ).rejects.toThrow('Positions must be unique');
  });

  it('should throw NotFoundException when deck is deleted', async () => {
    const user_id = 'user-1';
    const deck = await create_deck_handler.execute({
      user_id,
      name: 'Deck',
      front_language: 'es',
      back_language: 'en',
      visibility: 'private',
    });

    const lesson = await create_lesson_handler.execute({
      user_id,
      name: 'Lesson',
      deck_id: deck.id,
      position: 0,
      cards: [],
    });

    await decks_repository.save({
      ...deck,
      deleted_at: new Date(),
    });

    await expect(
      handler.execute({
        user_id,
        deck_id: deck.id,
        reorder_data: [{ lesson_id: lesson.id, position: 0 }],
      }),
    ).rejects.toThrow('Deck not found');
  });
});

