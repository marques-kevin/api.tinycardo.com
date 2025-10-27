import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StreakEntity } from '@/modules/streak/entities/streak_entity';
import { UsersEntity } from '@/modules/authentication/entities/users_entity';
import { StreakRepositoryPostgres } from '@/modules/streak/repositories/streak_repository_postgres';
import { StreakRepository } from '@/modules/streak/repositories/streak_repository';
import { v4 as uuidv4 } from 'uuid';

describe('StreakRepositoryPostgres', () => {
  let repository: StreakRepositoryPostgres;
  let module: TestingModule;
  let user_id: string;

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
          entities: [UsersEntity, StreakEntity],
        }),
        TypeOrmModule.forFeature([UsersEntity, StreakEntity]),
      ],
      providers: [
        {
          provide: StreakRepository,
          useClass: StreakRepositoryPostgres,
        },
      ],
    }).compile();

    repository = module.get(StreakRepository);

    // Create a test user
    const usersRepo = module.get<Repository<UsersEntity>>(
      getRepositoryToken(UsersEntity),
    );
    const testUser: UsersEntity = {
      id: uuidv4(),
      email: `${uuidv4()}@test.com`,
      language: 'en',
      created_at: new Date(),
      updated_at: new Date(),
    };
    await usersRepo.save(testUser);
    user_id = testUser.id;
  });

  afterAll(async () => {
    await module.close();
  });

  describe('Basic CRUD operations', () => {
    it('should save a streak successfully', async () => {
      const streak: StreakEntity = {
        id: uuidv4(),
        user_id,
        date: '2025-01-15',
      };

      const result = await repository.save(streak);

      expect(result).toEqual(streak);
    });

    it('should find a streak by id', async () => {
      const streak: StreakEntity = {
        id: uuidv4(),
        user_id,
        date: '2025-01-16',
      };

      await repository.save(streak);
      const result = await repository.find_by_id(streak.id);

      expect(result).toEqual(streak);
    });

    it('should find streaks by user_id', async () => {
      const streak1: StreakEntity = {
        id: uuidv4(),
        user_id,
        date: '2025-01-18',
      };
      const streak2: StreakEntity = {
        id: uuidv4(),
        user_id,
        date: '2025-01-19',
      };

      await repository.save(streak1);
      await repository.save(streak2);

      const result = await repository.find_all({
        where: { user_id },
      });

      expect(result.length).toBeGreaterThanOrEqual(2);
      expect(result.map((s) => s.date)).toContain('2025-01-18');
      expect(result.map((s) => s.date)).toContain('2025-01-19');
    });

    it('should find streaks by date', async () => {
      const date = '2025-01-20';

      // First, let's check if there are already streaks for this date
      const existing = await repository.find_all({
        where: { date },
      });

      // Create another user and their streak for this date
      const usersRepo = module.get<Repository<UsersEntity>>(
        getRepositoryToken(UsersEntity),
      );
      const anotherUser: UsersEntity = {
        id: uuidv4(),
        email: `${uuidv4()}@test.com`,
        language: 'en',
        created_at: new Date(),
        updated_at: new Date(),
      };
      await usersRepo.save(anotherUser);

      const streak2: StreakEntity = {
        id: uuidv4(),
        user_id: anotherUser.id,
        date,
      };

      await repository.save(streak2);

      const result = await repository.find_all({
        where: { date },
      });

      expect(result.length).toBeGreaterThanOrEqual(existing.length + 1);
      expect(result.every((s) => s.date === date)).toBe(true);
    });

    it('should return null if streak not found by id', async () => {
      const result = await repository.find_by_id('non-existent');

      expect(result).toBeNull();
    });

    it('should find all streaks', async () => {
      const streak1: StreakEntity = {
        id: uuidv4(),
        user_id,
        date: '2025-01-23',
      };

      const streak2: StreakEntity = {
        id: uuidv4(),
        user_id,
        date: '2025-01-24',
      };

      await repository.save(streak1);
      await repository.save(streak2);

      const result = await repository.find_all();
      expect(result.length).toBeGreaterThanOrEqual(2);
    });

    it('should find streaks with limit', async () => {
      const result = await repository.find_all({ take: 2 });
      expect(result.length).toBeLessThanOrEqual(2);
    });

    it('should respect unique constraint on user_id and date', async () => {
      const date = '2025-01-25';

      const streak1: StreakEntity = {
        id: uuidv4(),
        user_id,
        date,
      };

      await repository.save(streak1);

      // Try to save another streak with same user_id and date
      // This should throw an error due to unique constraint
      const streak2: StreakEntity = {
        id: uuidv4(),
        user_id,
        date,
      };

      await expect(repository.save(streak2)).rejects.toThrow();
    });
  });
});
