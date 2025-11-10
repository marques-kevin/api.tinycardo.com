import { create_testing_module } from '@/tests/create_testing_module';
import { LessonsUpsertLessonsHandler } from '@/modules/lessons/handlers/lessons_upsert_lessons_handler/lessons_upsert_lessons_handler';
import { DecksCreateDeckHandler } from '@/modules/decks/handlers/decks_create_deck_handler/decks_create_deck_handler';
import { LessonsRepository } from '@/modules/lessons/repositories/lessons_repository';

describe('lessons_upsert_lessons_handler', () => {
  let upsert_lessons: LessonsUpsertLessonsHandler;
  let create_deck: DecksCreateDeckHandler;
  let lessons_repository: LessonsRepository;

  beforeEach(async () => {
    const module = await create_testing_module();
    upsert_lessons = module.get(LessonsUpsertLessonsHandler);
    create_deck = module.get(DecksCreateDeckHandler);
    lessons_repository = module.get(LessonsRepository);
  });

  it('should be defined', () => {
    expect(upsert_lessons).toBeDefined();
  });

  it('should create lessons when none exist', async () => {
    const user_id = 'user-1';
    const deck = await create_deck.execute({
      user_id,
      name: 'Grammar Basics',
      front_language: 'es',
      back_language: 'en',
      visibility: 'private',
    });

    const result = await upsert_lessons.execute({
      user_id,
      deck_id: deck.id,
      lessons: [
        { name: 'Lesson 1', position: 0, cards: [] },
        { name: 'Lesson 2', position: 1, cards: ['card-1'] },
      ],
    });

    expect(result.lessons_saved).toBe(2);
    expect(result.lessons_removed).toBe(0);
    expect(result.lessons).toHaveLength(2);

    const saved = await lessons_repository.find_all({
      where: { deck_id: deck.id },
    });
    expect(saved.length).toBe(2);
    expect(saved.map((l) => l.name)).toEqual(
      expect.arrayContaining(['Lesson 1', 'Lesson 2']),
    );
  });

  it('should update existing, add new, and remove missing lessons', async () => {
    const user_id = 'user-2';
    const deck = await create_deck.execute({
      user_id,
      name: 'Vocabulary',
      front_language: 'es',
      back_language: 'en',
      visibility: 'private',
    });

    await upsert_lessons.execute({
      user_id,
      deck_id: deck.id,
      lessons: [
        { name: 'Greetings', position: 0, cards: ['card-a'] },
        { name: 'Food', position: 1, cards: ['card-b'] },
      ],
    });

    const existing = await lessons_repository.find_all({
      where: { deck_id: deck.id },
    });

    const update_result = await upsert_lessons.execute({
      user_id,
      deck_id: deck.id,
      lessons: [
        {
          id: existing[0].id,
          name: 'Greetings Updated',
          position: 1,
          cards: ['card-a', 'card-c'],
        },
        {
          name: 'Travel',
          position: 0,
          cards: [],
        },
      ],
    });

    expect(update_result.lessons_saved).toBe(2);
    expect(update_result.lessons_removed).toBe(1);
    expect(update_result.lessons).toHaveLength(2);

    const after = await lessons_repository.find_all({
      where: { deck_id: deck.id },
    });

    expect(after.length).toBe(2);
    const names = after.map((l) => l.name).sort();
    expect(names).toEqual(['Greetings Updated', 'Travel']);

    const updated = after.find((l) => l.name === 'Greetings Updated');
    expect(updated?.cards).toEqual(['card-a', 'card-c']);
    expect(updated?.position).toBe(1);
  });

  it('should reject when user has no access to deck', async () => {
    const owner_deck = await create_deck.execute({
      user_id: 'owner',
      name: 'Owner Deck',
      front_language: 'es',
      back_language: 'en',
      visibility: 'private',
    });

    await expect(
      upsert_lessons.execute({
        user_id: 'intruder',
        deck_id: owner_deck.id,
        lessons: [{ name: 'Lesson', position: 0, cards: [] }],
      }),
    ).rejects.toThrow('Deck not found');
  });
});
