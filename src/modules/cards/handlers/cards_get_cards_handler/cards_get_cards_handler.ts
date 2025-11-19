import { Injectable } from '@nestjs/common';
import { CardsRepository } from '@/modules/cards/repositories/cards_repository';
import { DecksRepository } from '@/modules/decks/repositories/decks_repository';
import { LessonsRepository } from '@/modules/lessons/repositories/lessons_repository';
import {
  CardsGetCardsDtoInput,
  CardsGetCardsDtoOutput,
} from '@/modules/cards/dtos/cards_get_cards_dto';
import { DecksCheckAccessHandler } from '@/modules/decks/handlers/decks_check_access_handler/decks_check_access_handler';

@Injectable()
export class CardsGetCardsHandler
  implements Handler<WithUserId<CardsGetCardsDtoInput>, CardsGetCardsDtoOutput>
{
  constructor(
    private readonly cards_repository: CardsRepository,
    private readonly decks_repository: DecksRepository,
    private readonly lessons_repository: LessonsRepository,
    private readonly decks_check_access_handler: DecksCheckAccessHandler,
  ) {}

  async execute(
    params: WithUserId<CardsGetCardsDtoInput>,
  ): Promise<CardsGetCardsDtoOutput> {
    await this.decks_check_access_handler.execute({
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

    return { cards: cards_sorted_by_lesson_position };
  }
}
