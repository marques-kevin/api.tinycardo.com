import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { DecksEntity } from '@/modules/decks/entities/decks_entity';
import { UsersEntity } from '@/modules/authentication/entities/users_entity';
import { DecksRepository } from '@/modules/decks/repositories/decks_repository';
import { DecksRepositoryPostgres } from '@/modules/decks/repositories/decks_repository_postgres';
import { HistoryEntity } from '@/modules/history/entities/history_entity';
import { HistoryRepositoryPostgres } from '@/modules/history/repositories/history_repository_postgres';
import { HistoryRepository } from '@/modules/history/repositories/history_repository';

describe('decks_repository_postgres.search (int)', () => {
  let decks_repository: DecksRepositoryPostgres;
  let history_repository: HistoryRepositoryPostgres;
  let testing_module: TestingModule;

  beforeAll(async () => {
    testing_module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: 'localhost',
          port: 5432,
          username: 'postgres',
          password: 'postgres',
          database: 'postgres',
          entities: [UsersEntity, DecksEntity, HistoryEntity],
        }),
        TypeOrmModule.forFeature([UsersEntity, DecksEntity, HistoryEntity]),
      ],
      providers: [
        {
          provide: DecksRepository,
          useClass: DecksRepositoryPostgres,
        },
        {
          provide: HistoryRepository,
          useClass: HistoryRepositoryPostgres,
        },
      ],
    }).compile();

    decks_repository = testing_module.get(DecksRepository);
    history_repository = testing_module.get(HistoryRepository);
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
    const users_repository_orm = testing_module.get<Repository<UsersEntity>>(
      getRepositoryToken(UsersEntity),
    );

    const ensure_user = async () => {
      const user: UsersEntity = {
        id: uuidv4(),
        email: `${uuidv4()}@test.com`,
        language: 'en',
        created_at: new Date(),
        updated_at: new Date(),
      };
      await users_repository_orm.save(user);
      return user;
    };

    const user_owner = await ensure_user();
    const user_1 = await ensure_user();
    const user_2 = await ensure_user();
    const user_3 = await ensure_user();
    const user_4 = await ensure_user();

    // prepare: seed decks
    await decks_repository.save(
      make_deck({ user_id: user_owner.id, name: 'Owner Deck' }),
    );
    await decks_repository.save(
      make_deck({
        user_id: user_1.id,
        name: 'Spanish Basics',
        front_language: 'es',
        back_language: 'en',
      }),
    );
    await decks_repository.save(
      make_deck({
        user_id: user_2.id,
        name: 'Spanish Advanced',
        front_language: 'es',
        back_language: 'fr',
      }),
    );
    await decks_repository.save(
      make_deck({
        user_id: user_3.id,
        name: 'French Basics',
        front_language: 'fr',
        back_language: 'en',
      }),
    );
    await decks_repository.save(
      make_deck({
        user_id: user_4.id,
        name: 'Private Deck',
        visibility: 'private',
      }),
    );

    // case: title filter (case-insensitive)
    const title_result = await decks_repository.search({
      limit: 10,
      page: 1,
      exclude_user_id: user_owner.id,
      title: 'spanish',
    });
    // assert
    expect(
      title_result.decks.every((d: DecksEntity) =>
        d.name.toLowerCase().includes('spanish'),
      ),
    ).toBe(true);
    expect(
      title_result.decks.every((d: DecksEntity) => d.user_id !== user_owner.id),
    ).toBe(true);

    // case: language filters
    const front_language_result = await decks_repository.search({
      limit: 10,
      page: 1,
      exclude_user_id: user_owner.id,
      front_language: 'es',
    });
    // assert

    expect(
      front_language_result.decks.every(
        (d: DecksEntity) => d.front_language === 'es',
      ),
    ).toBe(true);

    const back_language_result = await decks_repository.search({
      limit: 10,
      page: 1,
      exclude_user_id: user_owner.id,
      back_language: 'fr',
    });
    // assert
    expect(
      back_language_result.decks.every(
        (d: DecksEntity) => d.back_language === 'fr',
      ),
    ).toBe(true);

    // prepare: additional decks for pagination
    const extra_decks: DecksEntity[] = [];
    for (let i = 0; i < 8; i++) {
      const user = await ensure_user();

      extra_decks.push(
        make_deck({
          user_id: user.id,
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
      exclude_user_id: user_owner.id,
    });
    const page_2_result = await decks_repository.search({
      limit: 5,
      page: 2,
      exclude_user_id: user_owner.id,
    });

    // assert
    expect(page_1_result.decks.length).toBe(5);
    expect(page_2_result.decks.length).toBe(5);
    expect(page_1_result.total).toBeGreaterThanOrEqual(10);
  });

  it('refresh_decks_user_count refreshes MV with correct per-user counts', async () => {
    const users_repository_orm = testing_module.get<Repository<UsersEntity>>(
      getRepositoryToken(UsersEntity),
    );

    const ensure_user = async () => {
      const user: UsersEntity = {
        id: uuidv4(),
        email: `${uuidv4()}@test.com`,
        language: 'en',
        created_at: new Date(),
        updated_at: new Date(),
      };
      await users_repository_orm.save(user);

      return user;
    };

    const user_a = await ensure_user();
    const user_b = await ensure_user();

    const deck_who_noone_has_ever_used = await decks_repository.save({
      id: uuidv4(),
      name: 'deck_who_noone_has_ever_used',
      description: '',
      user_id: user_a.id,
      front_language: 'en',
      back_language: 'es',
      visibility: 'public',
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: null,
    });

    const deck_who_has_been_used_by_all_users = await decks_repository.save({
      id: uuidv4(),
      name: 'deck_who_has_been_used_by_all_users',
      description: '',
      user_id: user_a.id,
      front_language: 'en',
      back_language: 'es',
      visibility: 'public',
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: null,
    });

    await history_repository.save({
      id: uuidv4(),
      user_id: user_a.id,
      deck_id: deck_who_has_been_used_by_all_users.id,
      card_id: uuidv4(),
      repetition_count: 0,
      ease_factor: 2.5,
      next_due_at: new Date(),
      last_reviewed_at: new Date(),
      created_at: new Date(),
      updated_at: new Date(),
    });

    await decks_repository.refresh_decks_user_count();

    const rows_before_refresh = await decks_repository.get_decks_stats({
      deck_ids: [
        deck_who_has_been_used_by_all_users.id,
        deck_who_noone_has_ever_used.id,
      ],
    });

    expect(rows_before_refresh.length).toBe(2);
    expect(rows_before_refresh).toEqual([
      { deck_id: deck_who_noone_has_ever_used.id, user_count: 0 },
      { deck_id: deck_who_has_been_used_by_all_users.id, user_count: 1 },
    ]);

    await history_repository.save({
      id: uuidv4(),
      user_id: user_b.id,
      deck_id: deck_who_has_been_used_by_all_users.id,
      card_id: uuidv4(),
      repetition_count: 0,
      ease_factor: 2.5,
      next_due_at: new Date(),
      last_reviewed_at: new Date(),
      created_at: new Date(),
      updated_at: new Date(),
    });

    await decks_repository.refresh_decks_user_count();

    const rows_after_refresh = await decks_repository.get_decks_stats({
      deck_ids: [
        deck_who_noone_has_ever_used.id,
        deck_who_has_been_used_by_all_users.id,
      ],
    });

    expect(rows_after_refresh).toEqual([
      { deck_id: deck_who_noone_has_ever_used.id, user_count: 0 },
      { deck_id: deck_who_has_been_used_by_all_users.id, user_count: 2 },
    ]);
  });
});
