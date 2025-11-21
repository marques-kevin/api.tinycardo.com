import { Injectable } from '@nestjs/common';
import { createHmac } from 'crypto';
import { CardsGetTtsFilenameHandler } from '@/modules/cards/handlers/cards_get_tts_filename_handler/cards_get_tts_filename_handler';
import {
  CardsGenerateSignedUrlDtoInput,
  CardsGenerateSignedUrlDtoOutput,
} from '@/modules/cards/dtos/cards_generate_signed_url_dto';

const EXPIRATION_TIME = 3600; // 1 hour

@Injectable()
export class CardsGenerateSignedUrlHandler {
  constructor(
    private readonly get_tts_filename_handler: CardsGetTtsFilenameHandler,
  ) {}

  /**
   * Generates a Cloudflare signed URL using HMAC SHA256.
   * The worker expects the signature to be computed from: origin + pathname + ?exp=expiration
   */
  private generate_signed_url(params: {
    baseUrl: string;
    secret: string;
    expiresIn: number;
  }): string {
    // 1. Expiration UNIX timestamp
    const exp = Math.floor(Date.now() / 1000) + params.expiresIn;

    // 2. Parse the base URL to get origin and pathname
    const url = new URL(params.baseUrl);
    const base_url = url.origin + url.pathname;

    // 3. Create the URL string for signature (matches worker's url_for_signature)
    const url_for_signature = `${base_url}?exp=${exp}`;

    // 4. Generate HMAC SHA256 signature from the URL string
    const sig = createHmac('sha256', params.secret)
      .update(url_for_signature)
      .digest('hex');

    // 5. Return the complete signed URL with exp and sig parameters
    url.searchParams.set('exp', exp.toString());
    url.searchParams.set('sig', sig);

    return url.toString();
  }

  execute(
    params: CardsGenerateSignedUrlDtoInput,
  ): CardsGenerateSignedUrlDtoOutput {
    const cdn_url = process.env.CDN_URL as string;
    const cdn_secret = process.env.CDN_SIGNATURE_SECRET as string;

    if (!cdn_url || !cdn_secret) {
      throw new Error(
        'CDN_URL and CDN_SIGNATURE_SECRET environment variables are required',
      );
    }

    // Generate TTS filename
    const { filename } = this.get_tts_filename_handler.execute({
      text: params.text,
      language: params.language,
    });

    // Construct base URL
    const base_url = `${cdn_url}/${filename}`;

    // Generate signed URL
    const signed_url = this.generate_signed_url({
      baseUrl: base_url,
      secret: cdn_secret,
      expiresIn: EXPIRATION_TIME,
    });

    return { signed_url };
  }
}
