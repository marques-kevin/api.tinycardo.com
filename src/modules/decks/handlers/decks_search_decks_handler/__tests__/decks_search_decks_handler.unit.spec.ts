import { create_testing_module } from '@/tests/create_testing_module';
import { DecksSearchDecksHandler } from '@/modules/decks/handlers/decks_search_decks_handler/decks_search_decks_handler';
import { DecksCreateDeckHandler } from '@/modules/decks/handlers/decks_create_deck_handler/decks_create_deck_handler';

describe('decks_search_decks_handler', () => {
  let search_handler: DecksSearchDecksHandler;
  let create_handler: DecksCreateDeckHandler;
  const user_ctx = 'user-ctx';

  beforeEach(async () => {
    const module = await create_testing_module();
    search_handler = module.get(DecksSearchDecksHandler);
    create_handler = module.get(DecksCreateDeckHandler);
  });

  it('should be defined', () => {
    expect(search_handler).toBeDefined();
  });

  it('should return all non-deleted decks with default pagination', async () => {
    await create_handler.execute({
      user_id: 'user-1',
      name: 'Spanish Basics',
      front_language: 'es',
      back_language: 'en',
      visibility: 'public',
    });

    await create_handler.execute({
      user_id: 'user-2',
      name: 'French Basics',
      front_language: 'fr',
      back_language: 'en',
      visibility: 'public',
    });

    const result = await search_handler.execute({ user_id: user_ctx });

    expect(result.decks.length).toBe(2);
    expect(result.total).toBe(2);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(10);
    expect(result.total_pages).toBe(1);
  });

  it('should filter by front_language', async () => {
    await create_handler.execute({
      user_id: 'user-1',
      name: 'Spanish Basics',
      front_language: 'es',
      back_language: 'en',
      visibility: 'public',
    });

    await create_handler.execute({
      user_id: 'user-2',
      name: 'French Basics',
      front_language: 'fr',
      back_language: 'en',
      visibility: 'public',
    });

    await create_handler.execute({
      user_id: 'user-3',
      name: 'Spanish Advanced',
      front_language: 'es',
      back_language: 'en',
      visibility: 'public',
    });

    const result = await search_handler.execute({
      user_id: user_ctx,
      front_language: 'es',
    });

    expect(result.decks.length).toBe(2);
    expect(result.total).toBe(2);
    expect(result.decks.every((d) => d.front_language === 'es')).toBe(true);
  });

  it('should filter by back_language', async () => {
    await create_handler.execute({
      user_id: 'user-1',
      name: 'Spanish to English',
      front_language: 'es',
      back_language: 'en',
      visibility: 'public',
    });

    await create_handler.execute({
      user_id: 'user-2',
      name: 'Spanish to French',
      front_language: 'es',
      back_language: 'fr',
      visibility: 'public',
    });

    const result = await search_handler.execute({
      user_id: user_ctx,
      back_language: 'fr',
    });

    expect(result.decks.length).toBe(1);
    expect(result.total).toBe(1);
    expect(result.decks[0].back_language).toBe('fr');
  });

  it('should filter by title (case-insensitive partial match)', async () => {
    await create_handler.execute({
      user_id: 'user-1',
      name: 'Spanish Basics',
      front_language: 'es',
      back_language: 'en',
      visibility: 'public',
    });

    await create_handler.execute({
      user_id: 'user-2',
      name: 'Spanish Advanced',
      front_language: 'es',
      back_language: 'en',
      visibility: 'public',
    });

    await create_handler.execute({
      user_id: 'user-3',
      name: 'French Basics',
      front_language: 'fr',
      back_language: 'en',
      visibility: 'public',
    });

    const result = await search_handler.execute({
      user_id: user_ctx,
      title: 'spanish',
    });

    expect(result.decks.length).toBe(2);
    expect(result.total).toBe(2);
    expect(
      result.decks.every((d) => d.name.toLowerCase().includes('spanish')),
    ).toBe(true);
  });

  it('should filter by multiple criteria', async () => {
    await create_handler.execute({
      user_id: 'user-1',
      name: 'Spanish Basics',
      front_language: 'es',
      back_language: 'en',
      visibility: 'public',
    });

    await create_handler.execute({
      user_id: 'user-2',
      name: 'Spanish Advanced',
      front_language: 'es',
      back_language: 'fr',
      visibility: 'public',
    });

    await create_handler.execute({
      user_id: 'user-3',
      name: 'French Basics',
      front_language: 'fr',
      back_language: 'en',
      visibility: 'public',
    });

    const result = await search_handler.execute({
      user_id: user_ctx,
      front_language: 'es',
      back_language: 'en',
      title: 'basics',
    });

    expect(result.decks.length).toBe(1);
    expect(result.total).toBe(1);
    expect(result.decks[0].name).toBe('Spanish Basics');
    expect(result.decks[0].front_language).toBe('es');
    expect(result.decks[0].back_language).toBe('en');
  });

  it('should paginate results', async () => {
    // Create 15 decks
    for (let i = 1; i <= 15; i++) {
      await create_handler.execute({
        user_id: `user-${i}`,
        name: `Deck ${i}`,
        front_language: 'es',
        back_language: 'en',
        visibility: 'public',
      });
    }

    // Page 1 with limit 5
    const page1 = await search_handler.execute({
      user_id: user_ctx,
      limit: 5,
      page: 1,
    });

    expect(page1.decks.length).toBe(5);
    expect(page1.total).toBe(15);
    expect(page1.page).toBe(1);
    expect(page1.limit).toBe(5);
    expect(page1.total_pages).toBe(3);

    // Page 2 with limit 5
    const page2 = await search_handler.execute({
      user_id: user_ctx,
      limit: 5,
      page: 2,
    });

    expect(page2.decks.length).toBe(5);
    expect(page2.total).toBe(15);
    expect(page2.page).toBe(2);
    expect(page2.total_pages).toBe(3);

    // Page 3 with limit 5
    const page3 = await search_handler.execute({
      user_id: user_ctx,
      limit: 5,
      page: 3,
    });

    expect(page3.decks.length).toBe(5);
    expect(page3.total).toBe(15);
    expect(page3.page).toBe(3);
    expect(page3.total_pages).toBe(3);

    // Verify no overlap
    const page1_ids = page1.decks.map((d) => d.id);
    const page2_ids = page2.decks.map((d) => d.id);
    const page3_ids = page3.decks.map((d) => d.id);

    expect(page1_ids.some((id) => page2_ids.includes(id))).toBe(false);
    expect(page1_ids.some((id) => page3_ids.includes(id))).toBe(false);
    expect(page2_ids.some((id) => page3_ids.includes(id))).toBe(false);
  });

  it('should handle empty results', async () => {
    const result = await search_handler.execute({
      user_id: user_ctx,
      front_language: 'non-existent',
    });

    expect(result.decks.length).toBe(0);
    expect(result.total).toBe(0);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(10);
    expect(result.total_pages).toBe(0);
  });

  it('should use default limit of 10 when limit is 0 or negative', async () => {
    for (let i = 1; i <= 15; i++) {
      await create_handler.execute({
        user_id: `user-${i}`,
        name: `Deck ${i}`,
        front_language: 'es',
        back_language: 'en',
        visibility: 'public',
      });
    }

    const result = await search_handler.execute({
      user_id: user_ctx,
      limit: 0,
    });

    expect(result.limit).toBe(10);
    expect(result.decks.length).toBe(10);
  });

  it('should use page 1 when page is 0 or negative', async () => {
    await create_handler.execute({
      user_id: 'user-1',
      name: 'Deck 1',
      front_language: 'es',
      back_language: 'en',
      visibility: 'public',
    });

    const result = await search_handler.execute({
      user_id: user_ctx,
      page: 0,
    });

    expect(result.page).toBe(1);
  });
});
