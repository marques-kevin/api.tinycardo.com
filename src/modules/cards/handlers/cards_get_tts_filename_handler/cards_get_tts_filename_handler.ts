import { Injectable } from '@nestjs/common';
import { createHash } from 'crypto';
import {
  CardsGetTtsFilenameDtoInput,
  CardsGetTtsFilenameDtoOutput,
} from '@/modules/cards/dtos/cards_get_tts_filename_dto';

@Injectable()
export class CardsGetTtsFilenameHandler {
  /**
   * Maps language codes to storage format.
   * Extracts the base language code if a country code is provided (e.g., "en-US" -> "en").
   * This ensures consistent filename generation across different language code formats.
   */
  private map_language_code_to_storage_format(languageCode: string): string {
    // Extract the base language code if a country code is provided
    if (languageCode.includes('-')) {
      return languageCode.split('-')[0].toLowerCase();
    }

    // Return lowercase language code, default to 'en' if empty
    return languageCode.toLowerCase() || 'en';
  }

  execute(params: CardsGetTtsFilenameDtoInput): CardsGetTtsFilenameDtoOutput {
    // Map language code to storage format (e.g., "en-US" -> "en")
    const language_code = this.map_language_code_to_storage_format(
      params.language,
    );

    // Generate SHA256 hash of the text
    const hash = createHash('sha256').update(params.text).digest('hex');

    // Generate filename: tts/{language_code}/{hash}.mp3
    const filename = `tts/${language_code}/${hash}.mp3`;

    return { filename };
  }
}
