import { create_testing_module } from '@/tests/create_testing_module';
import { CardsGetSignedUrlsHandler } from '@/modules/cards/handlers/cards_get_signed_urls_handler/cards_get_signed_urls_handler';
import { CardsRepository } from '@/modules/cards/repositories/cards_repository';
import { DecksRepository } from '@/modules/decks/repositories/decks_repository';
import { v4 } from 'uuid';
import { createHmac } from 'crypto';

describe('cards_get_signed_urls_handler', () => {
  let handler: CardsGetSignedUrlsHandler;
  let cards_repository: CardsRepository;
  let decks_repository: DecksRepository;

  beforeEach(async () => {
    const module = await create_testing_module();
    handler = module.get(CardsGetSignedUrlsHandler);
    cards_repository = module.get(CardsRepository);
    decks_repository = module.get(DecksRepository);
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should return cards with signed URLs for front and back', async () => {
    const deck = await decks_repository.save({
      id: v4(),
      user_id: 'user-1',
      name: 'Spanish Basics',
      front_language: 'es',
      back_language: 'en',
      visibility: 'public',
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: null,
      description: 'Spanish Basics',
    });

    const card1 = await cards_repository.save({
      id: v4(),
      deck_id: deck.id,
      front: 'Hola',
      back: 'Hello',
      created_at: new Date(),
      updated_at: new Date(),
    });

    const card2 = await cards_repository.save({
      id: v4(),
      deck_id: deck.id,
      front: 'Adiós',
      back: 'Goodbye',
      created_at: new Date(),
      updated_at: new Date(),
    });

    const result = await handler.execute({
      user_id: 'user-1',
      deck_id: deck.id,
    });

    expect(result.cards.length).toBe(2);
    expect(result.cards[0].id).toBe(card1.id);
    expect(result.cards[0].front).toBe('Hola');
    expect(result.cards[0].back).toBe('Hello');
    expect(result.cards[0].front_signed_url).toBeDefined();
    expect(result.cards[0].back_signed_url).toBeDefined();
    expect(result.cards[1].id).toBe(card2.id);
    expect(result.cards[1].front_signed_url).toBeDefined();
    expect(result.cards[1].back_signed_url).toBeDefined();
  });

  it('should generate valid signed URLs with correct format', async () => {
    const deck = await decks_repository.save({
      id: v4(),
      user_id: 'user-1',
      name: 'Test Deck',
      front_language: 'en',
      back_language: 'fr',
      visibility: 'public',
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: null,
      description: 'Test Deck',
    });

    await cards_repository.save({
      id: v4(),
      deck_id: deck.id,
      front: 'Hello',
      back: 'Bonjour',
      created_at: new Date(),
      updated_at: new Date(),
    });

    const result = await handler.execute({
      user_id: 'user-1',
      deck_id: deck.id,
    });

    const card = result.cards[0];
    const frontUrl = new URL(card.front_signed_url);
    const backUrl = new URL(card.back_signed_url);

    // Verify URLs contain exp and sig parameters
    expect(frontUrl.searchParams.has('exp')).toBe(true);
    expect(frontUrl.searchParams.has('sig')).toBe(true);
    expect(backUrl.searchParams.has('exp')).toBe(true);
    expect(backUrl.searchParams.has('sig')).toBe(true);

    // Verify expiration is a valid number
    const frontExp = parseInt(frontUrl.searchParams.get('exp') || '0', 10);
    const backExp = parseInt(backUrl.searchParams.get('exp') || '0', 10);
    expect(frontExp).toBeGreaterThan(0);
    expect(backExp).toBeGreaterThan(0);

    // Verify expiration is approximately 1 hour from now (3600 seconds)
    const now = Math.floor(Date.now() / 1000);
    expect(frontExp).toBeGreaterThan(now);
    expect(frontExp).toBeLessThanOrEqual(now + 3600 + 5); // Allow 5 seconds tolerance
    expect(backExp).toBeGreaterThan(now);
    expect(backExp).toBeLessThanOrEqual(now + 3600 + 5);

    // Verify signature format (hex string)
    const frontSig = frontUrl.searchParams.get('sig') || '';
    const backSig = backUrl.searchParams.get('sig') || '';
    expect(frontSig).toMatch(/^[a-f0-9]{64}$/); // SHA256 hex is 64 chars
    expect(backSig).toMatch(/^[a-f0-9]{64}$/);
  });

  it('should generate signed URLs that match Cloudflare worker signature format', async () => {
    const deck = await decks_repository.save({
      id: v4(),
      user_id: 'user-1',
      name: 'Test Deck',
      front_language: 'en',
      back_language: 'en',
      visibility: 'public',
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: null,
      description: 'Test Deck',
    });

    await cards_repository.save({
      id: v4(),
      deck_id: deck.id,
      front: 'Test',
      back: 'Test',
      created_at: new Date(),
      updated_at: new Date(),
    });

    const result = await handler.execute({
      user_id: 'user-1',
      deck_id: deck.id,
    });

    const card = result.cards[0];
    const frontUrl = new URL(card.front_signed_url);
    const backUrl = new URL(card.back_signed_url);

    // Extract parameters
    const frontExp = frontUrl.searchParams.get('exp') || '';
    const frontSig = frontUrl.searchParams.get('sig') || '';
    const backExp = backUrl.searchParams.get('exp') || '';
    const backSig = backUrl.searchParams.get('sig') || '';

    // Reconstruct the URL string that should have been signed
    const frontBaseUrl = frontUrl.origin + frontUrl.pathname;
    const frontUrlForSignature = `${frontBaseUrl}?exp=${frontExp}`;
    const backBaseUrl = backUrl.origin + backUrl.pathname;
    const backUrlForSignature = `${backBaseUrl}?exp=${backExp}`;

    // Verify signature matches expected format (matches worker verification)
    const expectedFrontSig = createHmac(
      'sha256',
      process.env.CDN_SIGNATURE_SECRET as string,
    )
      .update(frontUrlForSignature)
      .digest('hex');
    const expectedBackSig = createHmac(
      'sha256',
      process.env.CDN_SIGNATURE_SECRET as string,
    )
      .update(backUrlForSignature)
      .digest('hex');

    expect(frontSig).toBe(expectedFrontSig);
    expect(backSig).toBe(expectedBackSig);
  });

  it('should return empty array when deck has no cards', async () => {
    const deck = await decks_repository.save({
      id: v4(),
      user_id: 'user-1',
      name: 'Empty Deck',
      front_language: 'en',
      back_language: 'en',
      visibility: 'public',
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: null,
      description: 'Empty Deck',
    });

    const result = await handler.execute({
      user_id: 'user-1',
      deck_id: deck.id,
    });

    expect(result.cards.length).toBe(0);
  });

  it('should throw when deck does not exist', async () => {
    await expect(
      handler.execute({
        user_id: 'user-1',
        deck_id: 'non-existent-deck',
      }),
    ).rejects.toThrow('Deck not found');
  });

  it('should throw ForbiddenException when accessing private deck owned by another user', async () => {
    const deck = await decks_repository.save({
      id: v4(),
      user_id: 'user-1',
      name: 'Private Deck',
      front_language: 'en',
      back_language: 'en',
      visibility: 'private',
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: null,
      description: 'Private Deck',
    });

    await expect(
      handler.execute({
        user_id: 'user-2',
        deck_id: deck.id,
      }),
    ).rejects.toThrow('Access denied: This deck is private');
  });

  it('should allow access to private deck when user is the owner', async () => {
    const deck = await decks_repository.save({
      id: v4(),
      user_id: 'user-1',
      name: 'Private Deck',
      front_language: 'en',
      back_language: 'en',
      visibility: 'private',
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: null,
      description: 'Private Deck',
    });

    await cards_repository.save({
      id: v4(),
      deck_id: deck.id,
      front: 'Test',
      back: 'Test',
      created_at: new Date(),
      updated_at: new Date(),
    });

    const result = await handler.execute({
      user_id: 'user-1',
      deck_id: deck.id,
    });

    expect(result.cards.length).toBe(1);
  });

  it('should allow access to public deck for any user', async () => {
    const deck = await decks_repository.save({
      id: v4(),
      user_id: 'user-1',
      name: 'Public Deck',
      front_language: 'en',
      back_language: 'en',
      visibility: 'public',
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: null,
      description: 'Public Deck',
    });

    await cards_repository.save({
      id: v4(),
      deck_id: deck.id,
      front: 'Test',
      back: 'Test',
      created_at: new Date(),
      updated_at: new Date(),
    });

    const result = await handler.execute({
      user_id: 'user-2',
      deck_id: deck.id,
    });

    expect(result.cards.length).toBe(1);
  });

  it('should generate different filenames for different languages', async () => {
    const deck = await decks_repository.save({
      id: v4(),
      user_id: 'user-1',
      name: 'Multi-language Deck',
      front_language: 'es',
      back_language: 'fr',
      visibility: 'public',
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: null,
      description: 'Multi-language Deck',
    });

    await cards_repository.save({
      id: v4(),
      deck_id: deck.id,
      front: 'Hola',
      back: 'Bonjour',
      created_at: new Date(),
      updated_at: new Date(),
    });

    const result = await handler.execute({
      user_id: 'user-1',
      deck_id: deck.id,
    });

    const card = result.cards[0];
    const frontUrl = new URL(card.front_signed_url);
    const backUrl = new URL(card.back_signed_url);

    // Front should use Spanish (es), back should use French (fr)
    expect(frontUrl.pathname).toContain('tts/es/');
    expect(backUrl.pathname).toContain('tts/fr/');

    // URLs should be different
    expect(frontUrl.toString()).not.toBe(backUrl.toString());
  });

  it('should handle language codes with country codes correctly', async () => {
    const deck = await decks_repository.save({
      id: v4(),
      user_id: 'user-1',
      name: 'Country Code Deck',
      front_language: 'en-US',
      back_language: 'fr-CA',
      visibility: 'public',
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: null,
      description: 'Country Code Deck',
    });

    await cards_repository.save({
      id: v4(),
      deck_id: deck.id,
      front: 'Hello',
      back: 'Bonjour',
      created_at: new Date(),
      updated_at: new Date(),
    });

    const result = await handler.execute({
      user_id: 'user-1',
      deck_id: deck.id,
    });

    const card = result.cards[0];
    const frontUrl = new URL(card.front_signed_url);
    const backUrl = new URL(card.back_signed_url);

    // Should extract base language code (en from en-US, fr from fr-CA)
    expect(frontUrl.pathname).toContain('tts/en/');
    expect(backUrl.pathname).toContain('tts/fr/');
  });
});
