import { Injectable } from '@nestjs/common';
import { DecksRepository } from '@/modules/decks/repositories/decks_repository';
import {
  DecksGetDeckByIdDto,
  DecksGetDeckByIdOutputDto,
} from '@/modules/decks/dtos/decks_get_deck_by_id_dto';
import { DecksEntityWithStats } from '@/modules/decks/entities/decks_entity';
import { CardsRepository } from '@/modules/cards/repositories/cards_repository';
import { HistoryRepository } from '@/modules/history/repositories/history_repository';
import { DecksCheckAccessHandler } from '@/modules/decks/handlers/decks_check_access_handler/decks_check_access_handler';

@Injectable()
export class DecksGetDeckByIdHandler
  implements
    Handler<
      DecksGetDeckByIdDto & { user_id?: string },
      DecksGetDeckByIdOutputDto
    >
{
  constructor(
    private readonly decks_repository: DecksRepository,
    private readonly cards_repository: CardsRepository,
    private readonly history_repository: HistoryRepository,
    private readonly decks_check_access_handler: DecksCheckAccessHandler,
  ) {}

  async execute(params: DecksGetDeckByIdDto & { user_id: string }) {
    const { deck } = await this.decks_check_access_handler.execute({
      deck_id: params.id,
      user_id: params.user_id,
      level: 'all',
    });

    const deck_stats = await this.decks_repository.get_decks_stats({
      deck_ids: [params.id],
    });
    const cards_count = await this.cards_repository.count({
      where: { deck_id: params.id },
    });
    const history = await this.history_repository.find_all({
      where: { deck_id: params.id, user_id: params.user_id },
    });

    const deck_with_stats: DecksEntityWithStats = {
      ...deck,
      number_of_cards: cards_count,
      number_of_cards_ready_to_be_reviewed: history.filter(
        (h) => h.next_due_at <= new Date(),
      ).length,
      number_of_cards_not_ready_to_be_reviewed: history.filter(
        (h) => h.next_due_at > new Date(),
      ).length,
      number_of_users_who_use_the_deck:
        deck_stats.find((s) => s.deck_id === params.id)?.user_count || 0,
    };

    return { deck: deck_with_stats };
  }
}
