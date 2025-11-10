import { create_testing_module } from '@/tests/create_testing_module';
import { AuthenticationDeleteAccountHandler } from '@/modules/authentication/handlers/authentication_delete_account_handler/authentication_delete_account_handler';
import { UsersRepository } from '@/modules/authentication/repositories/users_repository';
import { DecksRepository } from '@/modules/decks/repositories/decks_repository';
import { DecksCreateDeckHandler } from '@/modules/decks/handlers/decks_create_deck_handler/decks_create_deck_handler';
import { DecksUpsertCardsHandler } from '@/modules/decks/handlers/decks_upsert_cards_handler/decks_upsert_cards_handler';
import { CardsRepository } from '@/modules/cards/repositories/cards_repository';
import { v4 } from 'uuid';

describe('authentication_delete_account_handler', () => {
  let delete_account_handler: AuthenticationDeleteAccountHandler;
  let users_repository: UsersRepository;
  let decks_repository: DecksRepository;
  let cards_repository: CardsRepository;
  let create_deck_handler: DecksCreateDeckHandler;
  let upsert_cards_handler: DecksUpsertCardsHandler;

  beforeEach(async () => {
    const module = await create_testing_module();
    delete_account_handler = module.get(AuthenticationDeleteAccountHandler);
    users_repository = module.get(UsersRepository);
    decks_repository = module.get(DecksRepository);
    cards_repository = module.get(CardsRepository);
    create_deck_handler = module.get(DecksCreateDeckHandler);
    upsert_cards_handler = module.get(DecksUpsertCardsHandler);

    // Create the archived user for tests
    await users_repository.save({
      id: 'archived',
      email: 'archived@tinycardo.com',
      language: 'en',
      created_at: new Date(),
      updated_at: new Date(),
    });
  });

  it('should be defined', () => {
    expect(delete_account_handler).toBeDefined();
  });

  it('should delete user account', async () => {
    const user = await users_repository.save({
      id: 'user-to-delete',
      email: 'delete-me@example.com',
      language: 'en',
      created_at: new Date(),
      updated_at: new Date(),
    });

    await delete_account_handler.execute({
      user_id: user.id,
    });

    const deleted_user = await users_repository.find_by_id(user.id);
    expect(deleted_user).toBeNull();
  });

  it('should transfer user decks to archived user', async () => {
    const user = await users_repository.save({
      id: 'user-with-decks',
      email: 'user-with-decks@example.com',
      language: 'en',
      created_at: new Date(),
      updated_at: new Date(),
    });

    const deck1 = await create_deck_handler.execute({
      user_id: user.id,
      name: 'Spanish Basics',
      front_language: 'es',
      back_language: 'en',
      visibility: 'private',
    });

    const deck2 = await create_deck_handler.execute({
      user_id: user.id,
      name: 'French Basics',
      front_language: 'fr',
      back_language: 'en',
      visibility: 'private',
    });

    await delete_account_handler.execute({
      user_id: user.id,
    });

    const transferred_deck1 = await decks_repository.find_by_id(deck1.id);
    const transferred_deck2 = await decks_repository.find_by_id(deck2.id);

    expect(transferred_deck1).toBeDefined();
    expect(transferred_deck1?.user_id).toBe('archived');
    expect(transferred_deck1?.deleted_at).toBeDefined();
    expect(transferred_deck1?.deleted_at).toBeInstanceOf(Date);
    expect(transferred_deck2).toBeDefined();
    expect(transferred_deck2?.user_id).toBe('archived');
    expect(transferred_deck2?.deleted_at).toBeDefined();
    expect(transferred_deck2?.deleted_at).toBeInstanceOf(Date);
  });

  it('should preserve deck data when transferring to archived user', async () => {
    const user = await users_repository.save({
      id: 'user-test',
      email: 'test@example.com',
      language: 'en',
      created_at: new Date(),
      updated_at: new Date(),
    });

    const original_deck = await create_deck_handler.execute({
      user_id: user.id,
      name: 'Spanish Advanced',
      front_language: 'es',
      back_language: 'en',
      visibility: 'private',
    });

    await delete_account_handler.execute({
      user_id: user.id,
    });

    const transferred_deck = await decks_repository.find_by_id(
      original_deck.id,
    );

    expect(transferred_deck).toBeDefined();
    expect(transferred_deck?.id).toBe(original_deck.id);
    expect(transferred_deck?.name).toBe(original_deck.name);
    expect(transferred_deck?.front_language).toBe(original_deck.front_language);
    expect(transferred_deck?.back_language).toBe(original_deck.back_language);
    expect(transferred_deck?.user_id).toBe('archived');
  });

  it('should preserve cards when transferring deck ownership', async () => {
    const user = await users_repository.save({
      id: 'user-with-cards',
      email: 'user-cards@example.com',
      language: 'en',
      created_at: new Date(),
      updated_at: new Date(),
    });

    const deck = await create_deck_handler.execute({
      user_id: user.id,
      name: 'Spanish Basics',
      front_language: 'es',
      back_language: 'en',
      visibility: 'private',
    });

    await upsert_cards_handler.execute({
      user_id: user.id,
      deck_id: deck.id,
      cards: [
        { id: v4(), front: 'Hola', back: 'Hello' },
        { id: v4(), front: 'Adiós', back: 'Goodbye' },
        { id: v4(), front: 'Gracias', back: 'Thank you' },
      ],
    });

    const cards_before = await cards_repository.find_all({
      where: { deck_id: deck.id },
    });

    await delete_account_handler.execute({
      user_id: user.id,
    });

    const cards_after = await cards_repository.find_all({
      where: { deck_id: deck.id },
    });

    expect(cards_before.length).toBe(3);
    expect(cards_after.length).toBe(3);
    expect(cards_before.map((c) => c.id).sort()).toEqual(
      cards_after.map((c) => c.id).sort(),
    );
  });

  it('should work for user with no decks', async () => {
    const user = await users_repository.save({
      id: 'user-no-decks',
      email: 'no-decks@example.com',
      language: 'en',
      created_at: new Date(),
      updated_at: new Date(),
    });

    await delete_account_handler.execute({
      user_id: user.id,
    });

    const deleted_user = await users_repository.find_by_id(user.id);
    expect(deleted_user).toBeNull();
  });

  it('should transfer multiple decks to archived user', async () => {
    const user = await users_repository.save({
      id: 'user-multiple-decks',
      email: 'multiple@example.com',
      language: 'en',
      created_at: new Date(),
      updated_at: new Date(),
    });

    // Create 5 decks
    for (let i = 1; i <= 5; i++) {
      await create_deck_handler.execute({
        user_id: user.id,
        name: `Deck ${i}`,
        front_language: 'es',
        back_language: 'en',
        visibility: 'private',
      });
    }

    const decks_before = await decks_repository.find_all({
      where: { user_id: user.id },
    });

    expect(decks_before.length).toBe(5);

    await delete_account_handler.execute({
      user_id: user.id,
    });

    const archived_decks = await decks_repository.find_all({
      where: { user_id: 'archived' },
    });

    expect(archived_decks.length).toBeGreaterThanOrEqual(5);
  });
});
