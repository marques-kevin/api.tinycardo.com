import { create_testing_module } from '@/tests/create_testing_module';
import { LessonsGetLessonsHandler } from '@/modules/lessons/handlers/lessons_get_lessons_handler/lessons_get_lessons_handler';
import { LessonsCreateLessonHandler } from '@/modules/lessons/handlers/lessons_create_lesson_handler/lessons_create_lesson_handler';
import { DecksCreateDeckHandler } from '@/modules/decks/handlers/decks_create_deck_handler/decks_create_deck_handler';
import { DecksRepository } from '@/modules/decks/repositories/decks_repository';

describe('lessons_get_lessons_handler', () => {
  let get_lessons_handler: LessonsGetLessonsHandler;
  let create_lesson_handler: LessonsCreateLessonHandler;
  let create_deck_handler: DecksCreateDeckHandler;
  let decks_repository: DecksRepository;

  beforeEach(async () => {
    const module = await create_testing_module();
    get_lessons_handler = module.get(LessonsGetLessonsHandler);
    create_lesson_handler = module.get(LessonsCreateLessonHandler);
    create_deck_handler = module.get(DecksCreateDeckHandler);
    decks_repository = module.get(DecksRepository);
  });

  it('should be defined', () => {
    expect(get_lessons_handler).toBeDefined();
  });

  it('should return lessons ordered by position for deck owner', async () => {
    const user_id = 'user-1';
    const deck = await create_deck_handler.execute({
      user_id,
      name: 'Deck',
      front_language: 'es',
      back_language: 'en',
      visibility: 'private',
    });

    await create_lesson_handler.execute({
      user_id,
      name: 'Lesson B',
      deck_id: deck.id,
      position: 1,
      cards: [],
    });

    await create_lesson_handler.execute({
      user_id,
      name: 'Lesson A',
      deck_id: deck.id,
      position: 0,
      cards: [],
    });

    const result = await get_lessons_handler.execute({
      user_id,
      deck_id: deck.id,
    });

    expect(result.lessons.length).toBe(2);
    expect(result.lessons[0].position).toBe(0);
    expect(result.lessons[0].name).toBe('Lesson A');
    expect(result.lessons[1].position).toBe(1);
    expect(result.lessons[1].name).toBe('Lesson B');
  });

  it('should allow non-owner to access public deck lessons', async () => {
    const owner_id = 'owner';
    const viewer_id = 'viewer';
    const deck = await create_deck_handler.execute({
      user_id: owner_id,
      name: 'Public Deck',
      front_language: 'es',
      back_language: 'en',
      visibility: 'public',
    });

    await create_lesson_handler.execute({
      user_id: owner_id,
      name: 'Lesson',
      deck_id: deck.id,
      position: 0,
      cards: [],
    });

    const result = await get_lessons_handler.execute({
      user_id: viewer_id,
      deck_id: deck.id,
    });

    expect(result.lessons.length).toBeGreaterThanOrEqual(1);
  });

  it('should throw ForbiddenException when accessing private deck as non-owner', async () => {
    const owner_id = 'owner';
    const deck = await create_deck_handler.execute({
      user_id: owner_id,
      name: 'Private Deck',
      front_language: 'es',
      back_language: 'en',
      visibility: 'private',
    });

    await create_lesson_handler.execute({
      user_id: owner_id,
      name: 'Lesson',
      deck_id: deck.id,
      position: 0,
      cards: [],
    });

    await expect(
      get_lessons_handler.execute({
        user_id: 'intruder',
        deck_id: deck.id,
      }),
    ).rejects.toThrow('Access denied: This deck is private');
  });

  it('should throw NotFoundException when deck does not exist', async () => {
    await expect(
      get_lessons_handler.execute({
        user_id: 'user-1',
        deck_id: 'non-existent',
      }),
    ).rejects.toThrow('Deck not found');
  });

  it('should throw NotFoundException when deck is deleted', async () => {
    const user_id = 'user-1';
    const deck = await create_deck_handler.execute({
      user_id,
      name: 'Deck',
      front_language: 'es',
      back_language: 'en',
      visibility: 'public',
    });

    await decks_repository.save({
      ...deck,
      deleted_at: new Date(),
    });

    await expect(
      get_lessons_handler.execute({
        user_id,
        deck_id: deck.id,
      }),
    ).rejects.toThrow('Deck not found');
  });
});


