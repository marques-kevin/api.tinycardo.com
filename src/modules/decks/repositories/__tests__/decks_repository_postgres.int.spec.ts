import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

import { DecksEntity } from '@/modules/decks/entities/decks_entity';
import { UsersEntity } from '@/modules/authentication/entities/users_entity';
import { DecksRepository } from '@/modules/decks/repositories/decks_repository';
import { DecksRepositoryPostgres } from '@/modules/decks/repositories/decks_repository_postgres';

describe('decks_repository_postgres.search (int)', () => {
  let decks_repository: DecksRepositoryPostgres;
  let testing_module: TestingModule;

  beforeAll(async () => {
    // prepare: initialize testing module and clean database
    testing_module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: 'localhost',
          port: 5432,
          username: 'postgres',
          password: 'postgres',
          database: 'postgres',
          entities: [UsersEntity, DecksEntity],
        }),
        TypeOrmModule.forFeature([UsersEntity, DecksEntity]),
      ],
      providers: [
        {
          provide: DecksRepository,
          useClass: DecksRepositoryPostgres,
        },
      ],
    }).compile();

    decks_repository = testing_module.get(DecksRepository);

    // prepare: ensure a clean slate by deleting all decks then users
    const decks_repository_orm = testing_module.get<Repository<DecksEntity>>(
      getRepositoryToken(DecksEntity),
    );
    const users_repository_orm = testing_module.get<Repository<UsersEntity>>(
      getRepositoryToken(UsersEntity),
    );
    await decks_repository_orm
      .createQueryBuilder()
      .delete()
      .from(DecksEntity)
      .execute();
    await users_repository_orm
      .createQueryBuilder()
      .delete()
      .from(UsersEntity)
      .execute();
  });

  afterAll(async () => {
    await testing_module.close();
  });

  // prepare: factory to create deck entities
  const make_deck = (overrides: Partial<DecksEntity> = {}): DecksEntity => ({
    id: uuidv4(),
    name: 'Deck',
    description: 'Desc',
    user_id: 'owner',
    front_language: 'en',
    back_language: 'es',
    visibility: 'public',
    created_at: new Date(),
    updated_at: new Date(),
    deleted_at: null,
    ...overrides,
  });

  it('excludes owner, filters visibility/deleted, supports filters and pagination', async () => {
    // prepare: seed users that will own decks (FK: decks.user_id -> users.id)
    const users_repository_orm = testing_module.get<Repository<UsersEntity>>(
      getRepositoryToken(UsersEntity),
    );
    const ensure_user = async (id: string) => {
      const user: UsersEntity = {
        id,
        email: `${uuidv4()}@test.com`,
        language: 'en',
        created_at: new Date(),
        updated_at: new Date(),
      };
      await users_repository_orm.save(user);
    };

    await ensure_user('owner');
    await ensure_user('u1');
    await ensure_user('u2');
    await ensure_user('u3');
    await ensure_user('u4');

    // prepare: seed decks
    await decks_repository.save(
      make_deck({ user_id: 'owner', name: 'Owner Deck' }),
    );
    await decks_repository.save(
      make_deck({
        user_id: 'u1',
        name: 'Spanish Basics',
        front_language: 'es',
        back_language: 'en',
      }),
    );
    await decks_repository.save(
      make_deck({
        user_id: 'u2',
        name: 'Spanish Advanced',
        front_language: 'es',
        back_language: 'fr',
      }),
    );
    await decks_repository.save(
      make_deck({
        user_id: 'u3',
        name: 'French Basics',
        front_language: 'fr',
        back_language: 'en',
      }),
    );
    await decks_repository.save(
      make_deck({ user_id: 'u4', name: 'Private Deck', visibility: 'private' }),
    );

    // case: title filter (case-insensitive)
    const title_result = await decks_repository.search({
      limit: 10,
      page: 1,
      exclude_user_id: 'owner',
      title: 'spanish',
    });
    // assert
    expect(title_result.total).toBe(2);
    expect(
      title_result.decks.every((d: DecksEntity) =>
        d.name.toLowerCase().includes('spanish'),
      ),
    ).toBe(true);
    expect(
      title_result.decks.every((d: DecksEntity) => d.user_id !== 'owner'),
    ).toBe(true);

    // case: language filters
    const front_language_result = await decks_repository.search({
      limit: 10,
      page: 1,
      exclude_user_id: 'owner',
      front_language: 'es',
    });
    // assert
    expect(front_language_result.total).toBe(2);

    const back_language_result = await decks_repository.search({
      limit: 10,
      page: 1,
      exclude_user_id: 'owner',
      back_language: 'fr',
    });
    expect(back_language_result.total).toBe(1);
    expect(back_language_result.decks[0].back_language).toBe('fr');

    // prepare: additional decks for pagination
    const extra_decks: DecksEntity[] = [];
    for (let i = 0; i < 8; i++) {
      // prepare: ensure users px-i exist for FK
      await ensure_user(`px-${i}`);
      extra_decks.push(
        make_deck({
          user_id: `px-${i}`,
          name: `Deck ${i}`,
          front_language: 'en',
          back_language: 'es',
        }),
      );
    }
    for (const d of extra_decks) await decks_repository.save(d);

    // case: pagination
    const page_1_result = await decks_repository.search({
      limit: 5,
      page: 1,
      exclude_user_id: 'owner',
    });
    const page_2_result = await decks_repository.search({
      limit: 5,
      page: 2,
      exclude_user_id: 'owner',
    });

    // assert
    expect(page_1_result.decks.length).toBe(5);
    expect(page_2_result.decks.length).toBe(5);
    expect(page_1_result.total).toBeGreaterThanOrEqual(10); // seeded above + many
  });
});
