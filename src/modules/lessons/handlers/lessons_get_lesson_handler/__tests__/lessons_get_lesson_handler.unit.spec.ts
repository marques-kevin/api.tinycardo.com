import { create_testing_module } from '@/tests/create_testing_module';
import { LessonsGetLessonHandler } from '@/modules/lessons/handlers/lessons_get_lesson_handler/lessons_get_lesson_handler';
import { DecksCreateDeckHandler } from '@/modules/decks/handlers/decks_create_deck_handler/decks_create_deck_handler';
import { LessonsCreateLessonHandler } from '@/modules/lessons/handlers/lessons_create_lesson_handler/lessons_create_lesson_handler';
import { DecksRepository } from '@/modules/decks/repositories/decks_repository';

describe('lessons_get_lesson_handler', () => {
  let get_lesson_handler: LessonsGetLessonHandler;
  let create_lesson_handler: LessonsCreateLessonHandler;
  let create_deck_handler: DecksCreateDeckHandler;
  let decks_repository: DecksRepository;

  beforeEach(async () => {
    const module = await create_testing_module();
    get_lesson_handler = module.get(LessonsGetLessonHandler);
    create_lesson_handler = module.get(LessonsCreateLessonHandler);
    create_deck_handler = module.get(DecksCreateDeckHandler);
    decks_repository = module.get(DecksRepository);
  });

  it('should be defined', () => {
    expect(get_lesson_handler).toBeDefined();
  });

  it('should get a lesson from a public deck', async () => {
    const user_id = 'user-1';
    const deck = await create_deck_handler.execute({
      user_id,
      name: 'Public Deck',
      front_language: 'es',
      back_language: 'en',
      visibility: 'public',
    });

    const lesson = await create_lesson_handler.execute({
      user_id,
      name: 'Lesson 1',
      deck_id: deck.id,
      position: 0,
      cards: ['card-1', 'card-2'],
    });

    const result = await get_lesson_handler.execute({
      id: lesson.id,
      user_id: 'user-2',
    });

    expect(result).toBeDefined();
    expect(result.lesson.id).toBe(lesson.id);
    expect(result.lesson.name).toBe('Lesson 1');
    expect(result.lesson.deck_id).toBe(deck.id);
    expect(result.lesson.cards).toEqual(['card-1', 'card-2']);
  });

  it('should get a lesson from an unlisted deck', async () => {
    const user_id = 'user-1';
    const deck = await create_deck_handler.execute({
      user_id,
      name: 'Unlisted Deck',
      front_language: 'fr',
      back_language: 'en',
      visibility: 'unlisted',
    });

    const lesson = await create_lesson_handler.execute({
      user_id,
      name: 'Lesson 1',
      deck_id: deck.id,
      position: 0,
      cards: [],
    });

    const result = await get_lesson_handler.execute({
      id: lesson.id,
      user_id: 'user-2',
    });

    expect(result).toBeDefined();
    expect(result.lesson.id).toBe(lesson.id);
  });

  it('should get a lesson from a private deck if user is the owner', async () => {
    const user_id = 'user-1';
    const deck = await create_deck_handler.execute({
      user_id,
      name: 'Private Deck',
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

    const result = await get_lesson_handler.execute({
      id: lesson.id,
      user_id,
    });

    expect(result).toBeDefined();
    expect(result.lesson.id).toBe(lesson.id);
    expect(result.lesson.name).toBe('Lesson 1');
  });

  it('should throw ForbiddenException when accessing lesson from private deck as non-owner', async () => {
    const owner_id = 'owner';
    const deck = await create_deck_handler.execute({
      user_id: owner_id,
      name: 'Private Deck',
      front_language: 'es',
      back_language: 'en',
      visibility: 'private',
    });

    const lesson = await create_lesson_handler.execute({
      user_id: owner_id,
      name: 'Lesson 1',
      deck_id: deck.id,
      position: 0,
      cards: [],
    });

    await expect(
      get_lesson_handler.execute({
        id: lesson.id,
        user_id: 'intruder',
      }),
    ).rejects.toThrow('Access denied: This deck is private');
  });

  it('should throw NotFoundException when lesson does not exist', async () => {
    await expect(
      get_lesson_handler.execute({
        id: 'non-existent-id',
        user_id: 'user-1',
      }),
    ).rejects.toThrow('Lesson not found');
  });

  it('should throw NotFoundException when deck is deleted', async () => {
    const user_id = 'user-1';
    const deck = await create_deck_handler.execute({
      user_id,
      name: 'Deck to delete',
      front_language: 'es',
      back_language: 'en',
      visibility: 'public',
    });

    const lesson = await create_lesson_handler.execute({
      user_id,
      name: 'Lesson 1',
      deck_id: deck.id,
      position: 0,
      cards: [],
    });

    await decks_repository.save({
      ...deck,
      deleted_at: new Date(),
    });

    await expect(
      get_lesson_handler.execute({
        id: lesson.id,
        user_id: 'user-2',
      }),
    ).rejects.toThrow('Deck not found');
  });

  it('should return correct lesson properties', async () => {
    const user_id = 'user-1';
    const deck = await create_deck_handler.execute({
      user_id,
      name: 'Test Deck',
      front_language: 'fr',
      back_language: 'en',
      visibility: 'public',
    });

    const lesson = await create_lesson_handler.execute({
      user_id,
      name: 'Test Lesson',
      deck_id: deck.id,
      position: 5,
      cards: ['card-1', 'card-2', 'card-3'],
    });

    const result = await get_lesson_handler.execute({
      id: lesson.id,
      user_id: 'user-2',
    });

    expect(result.lesson.name).toBe('Test Lesson');
    expect(result.lesson.deck_id).toBe(deck.id);
    expect(result.lesson.position).toBe(5);
    expect(result.lesson.cards).toEqual(['card-1', 'card-2', 'card-3']);
    expect(result.lesson.created_at).toBeInstanceOf(Date);
    expect(result.lesson.updated_at).toBeInstanceOf(Date);
  });
});
