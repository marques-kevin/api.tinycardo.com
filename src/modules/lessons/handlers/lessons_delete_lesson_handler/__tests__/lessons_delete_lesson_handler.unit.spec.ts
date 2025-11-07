import { create_testing_module } from '@/tests/create_testing_module';
import { LessonsDeleteLessonHandler } from '@/modules/lessons/handlers/lessons_delete_lesson_handler/lessons_delete_lesson_handler';
import { LessonsRepository } from '@/modules/lessons/repositories/lessons_repository';
import { DecksRepository } from '@/modules/decks/repositories/decks_repository';
import { DecksCreateDeckHandler } from '@/modules/decks/handlers/decks_create_deck_handler/decks_create_deck_handler';
import { LessonsCreateLessonHandler } from '@/modules/lessons/handlers/lessons_create_lesson_handler/lessons_create_lesson_handler';

describe('lessons_delete_lesson_handler', () => {
  let delete_handler: LessonsDeleteLessonHandler;
  let create_lesson_handler: LessonsCreateLessonHandler;
  let create_deck_handler: DecksCreateDeckHandler;
  let lessons_repository: LessonsRepository;
  let decks_repository: DecksRepository;

  beforeEach(async () => {
    const module = await create_testing_module();
    delete_handler = module.get(LessonsDeleteLessonHandler);
    create_lesson_handler = module.get(LessonsCreateLessonHandler);
    create_deck_handler = module.get(DecksCreateDeckHandler);
    lessons_repository = module.get(LessonsRepository);
    decks_repository = module.get(DecksRepository);
  });

  it('should be defined', () => {
    expect(delete_handler).toBeDefined();
  });

  it('should delete a lesson', async () => {
    const user_id = 'user-1';
    const deck = await create_deck_handler.execute({
      user_id,
      name: 'Spanish Basics',
      front_language: 'es',
      back_language: 'en',
      visibility: 'private',
    });

    const lesson = await create_lesson_handler.execute({
      user_id,
      name: 'Lesson 1',
      deck_id: deck.id,
      position: 0,
      cards: [],
    });

    await delete_handler.execute({
      user_id,
      id: lesson.id,
    });

    const deleted = await lessons_repository.find_by_id(lesson.id);
    expect(deleted).toBeNull();
  });

  it('should not delete lessons from other decks', async () => {
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

    const lesson1 = await create_lesson_handler.execute({
      user_id,
      name: 'Lesson 1',
      deck_id: deck1.id,
      position: 0,
      cards: [],
    });

    const lesson2 = await create_lesson_handler.execute({
      user_id,
      name: 'Lesson 2',
      deck_id: deck2.id,
      position: 0,
      cards: [],
    });

    await delete_handler.execute({
      user_id,
      id: lesson1.id,
    });

    const deleted1 = await lessons_repository.find_by_id(lesson1.id);
    expect(deleted1).toBeNull();

    const remaining2 = await lessons_repository.find_by_id(lesson2.id);
    expect(remaining2).not.toBeNull();
    expect(remaining2?.id).toBe(lesson2.id);
  });

  it('should throw NotFoundException when lesson does not exist', async () => {
    await expect(
      delete_handler.execute({
        user_id: 'user-1',
        id: 'non-existent-id',
      }),
    ).rejects.toThrow('Lesson not found');
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
      delete_handler.execute({
        user_id: 'intruder',
        id: lesson.id,
      }),
    ).rejects.toThrow(
      'Access denied: You can only delete lessons in your own decks',
    );

    const lesson_still_exists = await lessons_repository.find_by_id(lesson.id);
    expect(lesson_still_exists).not.toBeNull();
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
      delete_handler.execute({
        user_id,
        id: lesson.id,
      }),
    ).rejects.toThrow('Deck not found');
  });
});
