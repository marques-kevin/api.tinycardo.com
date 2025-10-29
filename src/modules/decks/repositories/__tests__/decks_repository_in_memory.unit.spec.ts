import { DecksRepositoryInMemory } from '@/modules/decks/repositories/decks_repository_in_memory';
import { DecksEntity } from '@/modules/decks/entities/decks_entity';
import { v4 as uuidv4 } from 'uuid';

describe('decks_repository_in_memory.search', () => {
  let decks_repository: DecksRepositoryInMemory;

  beforeEach(() => {
    // prepare: new in-memory repository per test
    decks_repository = new DecksRepositoryInMemory();
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

  it('excludes owner and returns only public non-deleted', async () => {
    // prepare
    const owner_deck = make_deck({ user_id: 'owner', name: 'Owner Deck A' });
    const public_deck = make_deck({ user_id: 'other', name: 'Public Deck B' });
    const private_deck = make_deck({
      user_id: 'other',
      name: 'Private Deck',
      visibility: 'private',
    });
    const deleted_deck = make_deck({
      user_id: 'other',
      name: 'Deleted Deck',
      deleted_at: new Date() as any,
    });

    await decks_repository.save(owner_deck);
    await decks_repository.save(public_deck);
    await decks_repository.save(private_deck);
    await decks_repository.save(deleted_deck);

    // case
    const result = await decks_repository.search({
      limit: 10,
      page: 1,
      exclude_user_id: 'owner',
    });

    // assert
    expect(result.total).toBe(1);
    expect(result.decks.map((d: DecksEntity) => d.name)).toEqual([
      'Public Deck B',
    ]);
  });

  it('filters by front_language, back_language and title (case-insensitive)', async () => {
    // prepare
    await decks_repository.save(
      make_deck({
        name: 'Spanish Basics',
        front_language: 'es',
        back_language: 'en',
        user_id: 'u1',
      }),
    );
    await decks_repository.save(
      make_deck({
        name: 'Spanish Advanced',
        front_language: 'es',
        back_language: 'fr',
        user_id: 'u2',
      }),
    );
    await decks_repository.save(
      make_deck({
        name: 'French Basics',
        front_language: 'fr',
        back_language: 'en',
        user_id: 'u3',
      }),
    );

    // case: front_language
    const front_language_result = await decks_repository.search({
      limit: 10,
      page: 1,
      exclude_user_id: 'none',
      front_language: 'es',
    });
    // assert
    expect(front_language_result.total).toBe(2);
    expect(
      front_language_result.decks.every((d) => d.front_language === 'es'),
    ).toBe(true);

    // case: back_language
    const back_language_result = await decks_repository.search({
      limit: 10,
      page: 1,
      exclude_user_id: 'none',
      back_language: 'fr',
    });
    expect(back_language_result.total).toBe(1);
    expect(back_language_result.decks[0].back_language).toBe('fr');

    // case: title contains (case-insensitive)
    const title_result = await decks_repository.search({
      limit: 10,
      page: 1,
      exclude_user_id: 'none',
      title: 'spanish',
    });
    expect(title_result.total).toBe(2);
    expect(
      title_result.decks.every((d: DecksEntity) =>
        d.name.toLowerCase().includes('spanish'),
      ),
    ).toBe(true);
  });

  it('paginates and orders by created_at desc', async () => {
    // prepare: create 6 decks with increasing created_at
    const base = new Date('2025-01-01T00:00:00.000Z');
    for (let i = 0; i < 6; i++) {
      await decks_repository.save(
        make_deck({
          name: `Deck ${i + 1}`,
          user_id: `u${i + 1}`,
          created_at: new Date(base.getTime() + i * 1000),
          updated_at: new Date(base.getTime() + i * 1000),
        }),
      );
    }

    // case
    const page_1_result = await decks_repository.search({
      limit: 2,
      page: 1,
      exclude_user_id: 'n/a',
    });
    const page_2_result = await decks_repository.search({
      limit: 2,
      page: 2,
      exclude_user_id: 'n/a',
    });
    const page_3_result = await decks_repository.search({
      limit: 2,
      page: 3,
      exclude_user_id: 'n/a',
    });

    // assert - Desc order: Deck 6,5,4,3,2,1
    expect(page_1_result.decks.map((d: DecksEntity) => d.name)).toEqual([
      'Deck 6',
      'Deck 5',
    ]);
    expect(page_2_result.decks.map((d: DecksEntity) => d.name)).toEqual([
      'Deck 4',
      'Deck 3',
    ]);
    expect(page_3_result.decks.map((d: DecksEntity) => d.name)).toEqual([
      'Deck 2',
      'Deck 1',
    ]);
    expect(page_1_result.total).toBe(6);
  });
});
