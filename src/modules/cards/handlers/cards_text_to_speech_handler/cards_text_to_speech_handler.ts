import { Injectable, NotFoundException } from '@nestjs/common';
import { createHash } from 'crypto';
import { CardsRepository } from '@/modules/cards/repositories/cards_repository';
import { DecksRepository } from '@/modules/decks/repositories/decks_repository';
import { TextToSpeechService } from '@/modules/global/services/text_to_speech_service/text_to_speech_service';
import { StorageService } from '@/modules/global/services/storage_service/storage_service';
import {
  CardsTextToSpeechDtoInput,
  CardsTextToSpeechDtoOutput,
} from '@/modules/cards/dtos/cards_text_to_speech_dto';

@Injectable()
export class CardsTextToSpeechHandler
  implements Handler<CardsTextToSpeechDtoInput, CardsTextToSpeechDtoOutput>
{
  constructor(
    private readonly cards_repository: CardsRepository,
    private readonly decks_repository: DecksRepository,
    private readonly text_to_speech_service: TextToSpeechService,
    private readonly storage_service: StorageService,
  ) {}

  /**
   * Maps language codes to OpenAI TTS format.
   * OpenAI TTS uses ISO 639-1 language codes (e.g., "en", "fr", "es").
   * This function extracts the base language code if a country code is provided.
   */
  private map_language_code_to_openai_format(languageCode: string): string {
    // OpenAI TTS uses ISO 639-1 language codes (e.g., "en", "fr", "es")
    // Extract the base language code if a country code is provided
    if (languageCode.includes('-')) {
      return languageCode.split('-')[0].toLowerCase();
    }

    // Return lowercase language code, default to 'en' if empty
    return languageCode.toLowerCase() || 'en';
  }

  private async get_or_create_audio_url(params: {
    text: string;
    language: string;
  }): Promise<string> {
    const language_code = this.map_language_code_to_openai_format(
      params.language,
    );

    const hash = createHash('sha256').update(params.text).digest('hex');
    const filename = `tts/${params.language}/${hash}.wav`;

    const exists_result = await this.storage_service.file_exists({
      filename,
    });

    if (exists_result.exists) {
      return exists_result.url as string;
    }

    const audio = await this.text_to_speech_service.synthesize_speech({
      text: params.text,
      language: language_code,
    });

    const upload_result = await this.storage_service.upload_audio({
      audio: audio.audio,
      filename,
      contentType: 'audio/wav',
    });

    return upload_result.url;
  }

  async execute(
    params: CardsTextToSpeechDtoInput,
  ): Promise<CardsTextToSpeechDtoOutput> {
    const card = await this.cards_repository.find_by_id(params.card_id);

    if (!card) {
      throw new NotFoundException('Card not found');
    }

    const deck = await this.decks_repository.find_by_id(card.deck_id);

    if (!deck) {
      throw new NotFoundException('Deck not found');
    }

    const [front_url, back_url] = await Promise.all([
      this.get_or_create_audio_url({
        text: card.front,
        language: deck.front_language,
      }),
      this.get_or_create_audio_url({
        text: card.back,
        language: deck.back_language,
      }),
    ]);

    return {
      front_url,
      back_url,
    };
  }
}
