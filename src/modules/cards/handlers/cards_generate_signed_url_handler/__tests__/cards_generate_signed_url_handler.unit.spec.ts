import { create_testing_module } from '@/tests/create_testing_module';
import { CardsGenerateSignedUrlHandler } from '@/modules/cards/handlers/cards_generate_signed_url_handler/cards_generate_signed_url_handler';
import { createHmac } from 'crypto';

describe('cards_generate_signed_url_handler', () => {
  let handler: CardsGenerateSignedUrlHandler;

  const CDN_URL = 'https://cdn.example.com';
  const CDN_SECRET = 'test-secret-key';

  beforeEach(async () => {
    // Set environment variables
    process.env.CDN_URL = CDN_URL;
    process.env.CDN_SIGNATURE_SECRET = CDN_SECRET;

    const module = await create_testing_module();
    handler = module.get(CardsGenerateSignedUrlHandler);
  });

  afterEach(() => {
    delete process.env.CDN_URL;
    delete process.env.CDN_SIGNATURE_SECRET;
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should generate a valid signed URL', () => {
    const result = handler.execute({
      text: 'Hello',
      language: 'en',
    });

    expect(result.signed_url).toBeDefined();
    expect(typeof result.signed_url).toBe('string');
    expect(result.signed_url).toContain('https://cdn.example.com');
  });

  it('should generate signed URLs with correct format', () => {
    const result = handler.execute({
      text: 'Test',
      language: 'en',
    });

    const url = new URL(result.signed_url);

    // Verify URL contains exp and sig parameters
    expect(url.searchParams.has('exp')).toBe(true);
    expect(url.searchParams.has('sig')).toBe(true);

    // Verify expiration is a valid number
    const exp = parseInt(url.searchParams.get('exp') || '0', 10);
    expect(exp).toBeGreaterThan(0);

    // Verify expiration is approximately 1 hour from now (3600 seconds)
    const now = Math.floor(Date.now() / 1000);
    expect(exp).toBeGreaterThan(now);
    expect(exp).toBeLessThanOrEqual(now + 3600 + 5); // Allow 5 seconds tolerance

    // Verify signature format (hex string)
    const sig = url.searchParams.get('sig') || '';
    expect(sig).toMatch(/^[a-f0-9]{64}$/); // SHA256 hex is 64 chars
  });

  it('should generate signed URLs that match Cloudflare worker signature format', () => {
    const result = handler.execute({
      text: 'Test',
      language: 'en',
    });

    const url = new URL(result.signed_url);

    // Extract parameters
    const exp = url.searchParams.get('exp') || '';
    const sig = url.searchParams.get('sig') || '';

    // Reconstruct the URL string that should have been signed
    const baseUrl = url.origin + url.pathname;
    const urlForSignature = `${baseUrl}?exp=${exp}`;

    // Verify signature matches expected format (matches worker verification)
    const expectedSig = createHmac('sha256', CDN_SECRET)
      .update(urlForSignature)
      .digest('hex');

    expect(sig).toBe(expectedSig);
  });

  it('should generate different signed URLs for different texts', () => {
    const result1 = handler.execute({
      text: 'Hello',
      language: 'en',
    });

    const result2 = handler.execute({
      text: 'World',
      language: 'en',
    });

    expect(result1.signed_url).not.toBe(result2.signed_url);
  });

  it('should generate different signed URLs for different languages', () => {
    const result1 = handler.execute({
      text: 'Hello',
      language: 'en',
    });

    const result2 = handler.execute({
      text: 'Hello',
      language: 'fr',
    });

    expect(result1.signed_url).not.toBe(result2.signed_url);
  });

  it('should handle language codes with country codes correctly', () => {
    const result1 = handler.execute({
      text: 'Hello',
      language: 'en-US',
    });

    const result2 = handler.execute({
      text: 'Hello',
      language: 'en',
    });

    // Both should use 'en' in the filename, but URLs will be different due to different base URLs
    // The pathname should contain 'tts/en/' for both
    const url1 = new URL(result1.signed_url);
    const url2 = new URL(result2.signed_url);

    expect(url1.pathname).toContain('tts/en/');
    expect(url2.pathname).toContain('tts/en/');
  });

  it('should throw error when CDN_URL environment variable is missing', () => {
    delete process.env.CDN_URL;

    expect(() => {
      handler.execute({
        text: 'Test',
        language: 'en',
      });
    }).toThrow('CDN_URL and CDN_SIGNATURE_SECRET environment variables are required');

    // Restore for other tests
    process.env.CDN_URL = CDN_URL;
  });

  it('should throw error when CDN_SIGNATURE_SECRET environment variable is missing', () => {
    delete process.env.CDN_SIGNATURE_SECRET;

    expect(() => {
      handler.execute({
        text: 'Test',
        language: 'en',
      });
    }).toThrow('CDN_URL and CDN_SIGNATURE_SECRET environment variables are required');

    // Restore for other tests
    process.env.CDN_SIGNATURE_SECRET = CDN_SECRET;
  });

  it('should generate consistent signed URLs for the same input', () => {
    const result1 = handler.execute({
      text: 'Hello',
      language: 'en',
    });

    const result2 = handler.execute({
      text: 'Hello',
      language: 'en',
    });

    // URLs should be the same (except for expiration timestamp which changes)
    const url1 = new URL(result1.signed_url);
    const url2 = new URL(result2.signed_url);

    // Pathname should be the same
    expect(url1.pathname).toBe(url2.pathname);

    // Signatures should be different because expiration timestamps are different
    // But if we extract and compare just the pathname part, they should match
    expect(url1.pathname).toContain('tts/en/');
  });

  it('should generate signed URLs with correct path structure', () => {
    const result = handler.execute({
      text: 'Bonjour',
      language: 'fr',
    });

    const url = new URL(result.signed_url);

    // Should contain tts/{language}/{hash}.mp3 structure
    expect(url.pathname).toMatch(/^\/tts\/[a-z]+\/[a-f0-9]{64}\.mp3$/);
    expect(url.pathname).toContain('tts/fr/');
  });
});

