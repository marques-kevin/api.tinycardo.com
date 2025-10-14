import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersEntity } from '@/modules/authentication/entities/users_entity';
import { UsersRepositoryPostgres } from '@/modules/authentication/repositories/users_repository_postgres';
import { UsersRepository } from '@/modules/authentication/repositories/users_repository';
import { v4 as uuidv4 } from 'uuid';

describe('UsersRepositoryPostgres', () => {
  let repository: UsersRepositoryPostgres;
  let module: TestingModule;

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
          entities: [UsersEntity],
        }),
        TypeOrmModule.forFeature([UsersEntity]),
      ],
      providers: [
        {
          provide: UsersRepository,
          useClass: UsersRepositoryPostgres,
        },
      ],
    }).compile();

    repository = module.get(UsersRepository);
  });

  afterAll(async () => {
    await module.close();
  });

  describe('Basic CRUD operations', () => {
    it('should save a user successfully', async () => {
      const user: UsersEntity = {
        id: uuidv4(),
        email: `${uuidv4()}@test.com`,
        language: 'en',
        created_at: new Date(),
        updated_at: new Date(),
      };

      const result = await repository.save(user);

      expect(result).toEqual(user);
    });

    it('should create a user successfully', async () => {
      const user: UsersEntity = {
        id: uuidv4(),
        email: `${uuidv4()}@test.com`,
        language: 'en',
        created_at: new Date(),
        updated_at: new Date(),
      };

      const result = await repository.save(user);

      expect(result.id).toBe(user.id);
      expect(result.email).toBe(user.email);
      expect(result.language).toBe(user.language);
      expect(result.created_at).toBe(user.created_at);
      expect(result.updated_at).toBe(user.updated_at);
    });

    it('should find a user by id', async () => {
      const user: UsersEntity = {
        id: uuidv4(),
        email: `${uuidv4()}@test.com`,
        language: 'en',
        created_at: new Date(),
        updated_at: new Date(),
      };

      await repository.save(user);
      const result = await repository.find_by_id(user.id);

      expect(result).toEqual(user);
    });

    it('should find a user by email', async () => {
      const user: UsersEntity = {
        id: uuidv4(),
        email: `${uuidv4()}@test.com`,
        language: 'en',
        created_at: new Date(),
        updated_at: new Date(),
      };

      await repository.save(user);
      const result = await repository.find_all({
        where: { email: user.email },
      });

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(user);
    });

    it('should return null if user not found by id', async () => {
      const result = await repository.find_by_id('non-existent');

      expect(result).toBeNull();
    });

    it('should return null if user not found by email', async () => {
      const result = await repository.find_all({
        where: { email: 'non-existent@test.com' },
      });

      expect(result).toHaveLength(0);
    });

    it('should find all users', async () => {
      const user1: UsersEntity = {
        id: uuidv4(),
        email: `${uuidv4()}@test.com`,
        language: 'en',
        created_at: new Date(),
        updated_at: new Date(),
      };

      const user2: UsersEntity = {
        id: uuidv4(),
        email: `${uuidv4()}@test.com`,
        language: 'fr',
        created_at: new Date(),
        updated_at: new Date(),
      };

      await repository.save(user1);
      await repository.save(user2);

      const result = await repository.find_all();
      expect(result.length).toBeGreaterThanOrEqual(2);
    });

    it('should find all users with limit', async () => {
      const result = await repository.find_all({ take: 1 });
      expect(result.length).toBeLessThanOrEqual(1);
    });
  });
});
