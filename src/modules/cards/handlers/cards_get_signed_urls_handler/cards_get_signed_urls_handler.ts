import { Injectable } from '@nestjs/common';
import { createHash, createHmac } from 'crypto';
import { CardsRepository } from '@/modules/cards/repositories/cards_repository';
import { DecksCheckAccessHandler } from '@/modules/decks/handlers/decks_check_access_handler/decks_check_access_handler';
import {
  CardsGetSignedUrlsDtoInput,
  CardsGetSignedUrlsDtoOutput,
  CardWithSignedUrls,
} from '@/modules/cards/dtos/cards_get_signed_urls_dto';

const EXPIRATION_TIME = 3600; // 1 hour

@Injectable()
export class CardsGetSignedUrlsHandler
  implements
    Handler<WithUserId<CardsGetSignedUrlsDtoInput>, CardsGetSignedUrlsDtoOutput>
{
  constructor(
    private readonly cards_repository: CardsRepository,
    private readonly decks_check_access_handler: DecksCheckAccessHandler,
  ) {}

  /**
   * Maps language codes to match the format used in TTS file storage.
   * This should match the logic in CardsTextToSpeechHandler.
   */
  private map_language_code_to_storage_format(languageCode: string): string {
    // Extract the base language code if a country code is provided
    if (languageCode.includes('-')) {
      return languageCode.split('-')[0].toLowerCase();
    }

    return languageCode.toLowerCase() || 'en';
  }

  /**
   * Generates the filename for a TTS audio file based on text and language.
   * This matches the logic used in CardsTextToSpeechHandler.
   */
  private get_tts_filename(text: string, language: string): string {
    const language_code = this.map_language_code_to_storage_format(language);
    const hash = createHash('sha256').update(text).digest('hex');
    return `tts/${language_code}/${hash}.mp3`;
  }

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

  async execute(
    params: WithUserId<CardsGetSignedUrlsDtoInput>,
  ): Promise<CardsGetSignedUrlsDtoOutput> {
    const cdn_url = process.env.CDN_URL as string;
    const cdn_secret = process.env.CDN_SIGNATURE_SECRET as string;

    if (!cdn_url || !cdn_secret) {
      throw new Error(
        'CDN_URL and CDN_SIGNATURE_SECRET environment variables are required',
      );
    }

    const { deck } = await this.decks_check_access_handler.execute({
      deck_id: params.deck_id,
      user_id: params.user_id,
      level: 'all',
    });

    const cards = await this.cards_repository.find_all({
      where: { deck_id: params.deck_id },
    });

    const cards_with_signed_urls: CardWithSignedUrls[] = cards.map(
      (card): CardWithSignedUrls => {
        const front_filename = this.get_tts_filename(
          card.front,
          deck.front_language,
        );
        const back_filename = this.get_tts_filename(
          card.back,
          deck.back_language,
        );

        // Generate signed URLs using Cloudflare's signing method
        const front_base_url = `${cdn_url}/${front_filename}`;
        const back_base_url = `${cdn_url}/${back_filename}`;

        const front_signed_url = this.generate_signed_url({
          baseUrl: front_base_url,
          secret: cdn_secret,
          expiresIn: EXPIRATION_TIME,
        });

        const back_signed_url = this.generate_signed_url({
          baseUrl: back_base_url,
          secret: cdn_secret,
          expiresIn: EXPIRATION_TIME,
        });

        return {
          ...card,
          front_signed_url,
          back_signed_url,
        };
      },
    );

    return {
      cards: cards_with_signed_urls,
    };
  }
}
