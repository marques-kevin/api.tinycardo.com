import { Injectable } from '@nestjs/common';
import { CardsRepository } from '@/modules/cards/repositories/cards_repository';
import { LessonsRepository } from '@/modules/lessons/repositories/lessons_repository';
import {
  CardsGetCardsDtoInput,
  CardsGetCardsDtoOutput,
} from '@/modules/cards/dtos/cards_get_cards_dto';
import { DecksCheckAccessHandler } from '@/modules/decks/handlers/decks_check_access_handler/decks_check_access_handler';
import { CardsGenerateSignedUrlHandler } from '@/modules/cards/handlers/cards_generate_signed_url_handler/cards_generate_signed_url_handler';
import { CardWithAudioUrls } from '@/modules/cards/entities/cards_entity';

@Injectable()
export class CardsGetCardsHandler
  implements Handler<WithUserId<CardsGetCardsDtoInput>, CardsGetCardsDtoOutput>
{
  constructor(
    private readonly cards_repository: CardsRepository,
    private readonly lessons_repository: LessonsRepository,
    private readonly decks_check_access_handler: DecksCheckAccessHandler,
    private readonly generate_signed_url_handler: CardsGenerateSignedUrlHandler,
  ) {}

  async execute(
    params: WithUserId<CardsGetCardsDtoInput>,
  ): Promise<CardsGetCardsDtoOutput> {
    const { deck } = await this.decks_check_access_handler.execute({
      deck_id: params.deck_id,
      user_id: params.user_id,
      level: 'all',
    });

    const [cards, lesson] = await Promise.all([
      this.cards_repository.find_all({
        where: { deck_id: params.deck_id },
      }),
      this.lessons_repository.find_all({
        where: { deck_id: params.deck_id },
      }),
    ]);

    const cards_sorted_by_lesson_position = cards.sort((a, b) => {
      const lesson_a = lesson.find((l) => l.cards.includes(a.id));
      const lesson_b = lesson.find((l) => l.cards.includes(b.id));
      return (lesson_a?.position ?? 100) - (lesson_b?.position ?? 100);
    });

    const cards_with_audio_urls: CardWithAudioUrls[] =
      cards_sorted_by_lesson_position.map((card): CardWithAudioUrls => {
        const front_audio_url = this.generate_signed_url_handler.execute({
          text: card.front,
          language: deck.front_language,
        }).signed_url;

        const back_audio_url = this.generate_signed_url_handler.execute({
          text: card.back,
          language: deck.back_language,
        }).signed_url;

        return {
          ...card,
          front_audio_url,
          back_audio_url,
        };
      });

    return { cards: cards_with_audio_urls };
  }
}
