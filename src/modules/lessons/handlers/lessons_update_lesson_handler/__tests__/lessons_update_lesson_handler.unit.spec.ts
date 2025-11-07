import { create_testing_module } from '@/tests/create_testing_module';
import { LessonsUpdateLessonHandler } from '@/modules/lessons/handlers/lessons_update_lesson_handler/lessons_update_lesson_handler';
import { LessonsRepository } from '@/modules/lessons/repositories/lessons_repository';
import { DecksRepository } from '@/modules/decks/repositories/decks_repository';
import { DecksCreateDeckHandler } from '@/modules/decks/handlers/decks_create_deck_handler/decks_create_deck_handler';
import { LessonsCreateLessonHandler } from '@/modules/lessons/handlers/lessons_create_lesson_handler/lessons_create_lesson_handler';

describe('lessons_update_lesson_handler', () => {
  let update_handler: LessonsUpdateLessonHandler;
  let create_lesson_handler: LessonsCreateLessonHandler;
  let create_deck_handler: DecksCreateDeckHandler;
  let lessons_repository: LessonsRepository;
  let decks_repository: DecksRepository;

  beforeEach(async () => {
    const module = await create_testing_module();
    update_handler = module.get(LessonsUpdateLessonHandler);
    create_lesson_handler = module.get(LessonsCreateLessonHandler);
    create_deck_handler = module.get(DecksCreateDeckHandler);
    lessons_repository = module.get(LessonsRepository);
    decks_repository = module.get(DecksRepository);
  });

  it('should be defined', () => {
    expect(update_handler).toBeDefined();
  });

  it('should update an existing lesson fields', async () => {
    const user_id = 'user-1';
    const deck = await create_deck_handler.execute({
      user_id,
      name: 'Spanish Basics',
      front_language: 'es',
      back_language: 'en',
      visibility: 'private',
    });

    const created = await create_lesson_handler.execute({
      user_id,
      name: 'Lesson 1',
      deck_id: deck.id,
      position: 0,
      cards: ['card-1'],
    });

    const updated = await update_handler.execute({
      user_id,
      id: created.id,
      name: 'Updated Lesson',
      position: 1,
      cards: ['card-1', 'card-2', 'card-3'],
    });

    expect(updated.id).toBe(created.id);
    expect(updated.deck_id).toBe(deck.id);
    expect(updated.name).toBe('Updated Lesson');
    expect(updated.position).toBe(1);
    expect(updated.cards).toEqual(['card-1', 'card-2', 'card-3']);

    const stored = await lessons_repository.find_by_id(created.id);
    expect(stored).toEqual(updated);
  });

  it('should update only name when other fields are not provided', async () => {
    const user_id = 'user-1';
    const deck = await create_deck_handler.execute({
      user_id,
      name: 'French Basics',
      front_language: 'fr',
      back_language: 'en',
      visibility: 'private',
    });

    const created = await create_lesson_handler.execute({
      user_id,
      name: 'Original Name',
      deck_id: deck.id,
      position: 5,
      cards: ['card-1', 'card-2'],
    });

    const updated = await update_handler.execute({
      user_id,
      id: created.id,
      name: 'New Name',
    });

    expect(updated.name).toBe('New Name');
    expect(updated.position).toBe(5);
    expect(updated.cards).toEqual(['card-1', 'card-2']);
  });

  it('should throw NotFoundException when lesson does not exist', async () => {
    await expect(
      update_handler.execute({
        user_id: 'user-1',
        id: 'non-existent-id',
        name: 'Updated',
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
      update_handler.execute({
        user_id: 'intruder',
        id: lesson.id,
        name: 'Hacked',
      }),
    ).rejects.toThrow(
      'Access denied: You can only update lessons in your own decks',
    );
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
      update_handler.execute({
        user_id,
        id: lesson.id,
        name: 'Updated',
      }),
    ).rejects.toThrow('Deck not found');
  });
});
