import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

import { LessonEntity } from '@/modules/lessons/entities/lesson_entity';
import { LessonsRepositoryPostgres } from '@/modules/lessons/repositories/lessons_repository_postgres';
import { LessonsRepository } from '@/modules/lessons/repositories/lessons_repository';
import { DecksEntity } from '@/modules/decks/entities/decks_entity';
import { UsersEntity } from '@/modules/authentication/entities/users_entity';

describe('LessonsRepositoryPostgres', () => {
  let repository: LessonsRepositoryPostgres;
  let module: TestingModule;
  let deck_id: string;
  let lessons_typeorm_repository: Repository<LessonEntity>;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: 'localhost',
          port: 5432,
          username: 'postgres',
          password: 'postgres',
          database: 'postgres',
          entities: [UsersEntity, DecksEntity, LessonEntity],
        }),
        TypeOrmModule.forFeature([UsersEntity, DecksEntity, LessonEntity]),
      ],
      providers: [
        {
          provide: LessonsRepository,
          useClass: LessonsRepositoryPostgres,
        },
      ],
    }).compile();

    repository = module.get(LessonsRepository);
    lessons_typeorm_repository = module.get<Repository<LessonEntity>>(
      getRepositoryToken(LessonEntity),
    );

    // Create a test user
    const users_repository = module.get<Repository<UsersEntity>>(
      getRepositoryToken(UsersEntity),
    );
    const testUser: UsersEntity = {
      id: uuidv4(),
      email: `${uuidv4()}@test.com`,
      language: 'en',
      created_at: new Date(),
      updated_at: new Date(),
    };
    await users_repository.save(testUser);

    const decks_repository = module.get<Repository<DecksEntity>>(
      getRepositoryToken(DecksEntity),
    );

    const deck: DecksEntity = {
      id: uuidv4(),
      name: 'Test Deck',
      description: 'Integration test deck',
      user_id: testUser.id,
      front_language: 'en',
      back_language: 'es',
      visibility: 'public',
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: null,
    } as DecksEntity;

    await decks_repository.save(deck);
    deck_id = deck.id;
  });

  afterEach(async () => {
    await lessons_typeorm_repository
      .createQueryBuilder()
      .delete()
      .from(LessonEntity)
      .execute();
  });

  afterAll(async () => {
    await module.close();
  });

  describe('Basic CRUD operations', () => {
    it('should save a lesson successfully', async () => {
      const lesson_id = uuidv4();
      const saved_lesson = await repository.save({
        id: lesson_id,
        name: 'Lesson 1',
        deck_id,
        position: 1,
        cards: [],
      } as unknown as LessonEntity);

      expect(saved_lesson.id).toBe(lesson_id);
      expect(saved_lesson.name).toBe('Lesson 1');
      expect(saved_lesson.deck_id).toBe(deck_id);
      expect(saved_lesson.position).toBe(1);
      expect(Array.isArray(saved_lesson.cards)).toBe(true);
      expect(saved_lesson.created_at).toBeInstanceOf(Date);
      expect(saved_lesson.updated_at).toBeInstanceOf(Date);
    });

    it('should find a lesson by id', async () => {
      const lesson = {
        id: uuidv4(),
        name: 'Find Me',
        deck_id,
        position: 2,
        cards: ['card-1', 'card-2'],
      } as LessonEntity;

      await repository.save(lesson);

      const result = await repository.find_by_id(lesson.id);

      expect(result).not.toBeNull();
      expect(result?.id).toBe(lesson.id);
      expect(result?.name).toBe('Find Me');
      expect(result?.cards).toEqual(['card-1', 'card-2']);
    });

    it('should find lessons by deck_id', async () => {
      const lesson_a = {
        id: uuidv4(),
        name: 'Lesson A',
        deck_id,
        position: 1,
        cards: ['a'],
      } as LessonEntity;

      const lesson_b = {
        id: uuidv4(),
        name: 'Lesson B',
        deck_id,
        position: 2,
        cards: ['b'],
      } as LessonEntity;

      await repository.save(lesson_a);
      await repository.save(lesson_b);

      const results = await repository.find_all({
        where: { deck_id },
        order: ['position', 'ASC'],
      });

      expect(results.length).toBeGreaterThanOrEqual(2);
      expect(results.map((l) => l.id)).toEqual(
        expect.arrayContaining([lesson_a.id, lesson_b.id]),
      );
    });

    it('should update an existing lesson', async () => {
      const lesson = {
        id: uuidv4(),
        name: 'Original Name',
        deck_id,
        position: 3,
        cards: ['initial-card'],
      } as LessonEntity;

      await repository.save(lesson);

      const updated = await repository.save({
        ...lesson,
        name: 'Updated Name',
        cards: ['updated-card-1', 'updated-card-2'],
      });

      expect(updated.name).toBe('Updated Name');
      expect(updated.cards).toEqual(['updated-card-1', 'updated-card-2']);
      expect(updated.updated_at).toBeInstanceOf(Date);
    });

    it('should delete a lesson', async () => {
      const lesson = {
        id: uuidv4(),
        name: 'To Be Deleted',
        deck_id,
        position: 4,
        cards: [],
      } as unknown as LessonEntity;

      await repository.save(lesson);

      await repository.delete(lesson.id);

      const result = await repository.find_by_id(lesson.id);
      expect(result).toBeNull();
    });
  });
});
