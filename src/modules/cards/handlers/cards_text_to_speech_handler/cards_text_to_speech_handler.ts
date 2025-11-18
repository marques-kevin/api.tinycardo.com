import { Injectable, NotFoundException } from '@nestjs/common';
import { createHash } from 'crypto';
import { CardsRepository } from '@/modules/cards/repositories/cards_repository';
import { DecksRepository } from '@/modules/decks/repositories/decks_repository';
import { TextToSpeechService } from '@/modules/global/services/text_to_speech_service/text_to_speech_service';
import { CloudflareService } from '@/modules/global/services/cloudflare_service/cloudflare_service';
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
    private readonly cloudflare_service: CloudflareService,
  ) {}

  private async get_or_create_audio_url(params: {
    text: string;
    language: string;
    filename: string;
  }): Promise<string> {
    const exists_result = await this.cloudflare_service.file_exists({
      filename: params.filename,
    });

    if (exists_result.exists) {
      return exists_result.url as string;
    }

    const audio = await this.text_to_speech_service.synthesize_speech({
      text: params.text,
      language: params.language,
    });

    const upload_result = await this.cloudflare_service.upload_audio({
      audio: audio.audio,
      filename: params.filename,
    });

    return upload_result.url;
  }

  private async get_audio_filename(params: {
    text: string;
    language: string;
  }): Promise<string> {
    const hash = createHash('sha256').update(params.text).digest('hex');
    return `/${params.language}/${hash}.wav`;
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

    const front_filename = await this.get_audio_filename({
      text: card.front,
      language: deck.front_language,
    });
    const back_filename = await this.get_audio_filename({
      text: card.back,
      language: deck.back_language,
    });

    const [front_url, back_url] = await Promise.all([
      this.get_or_create_audio_url({
        text: card.front,
        language: deck.front_language,
        filename: front_filename,
      }),
      this.get_or_create_audio_url({
        text: card.back,
        language: deck.back_language,
        filename: back_filename,
      }),
    ]);

    return {
      front_url,
      back_url,
    };
  }
}
