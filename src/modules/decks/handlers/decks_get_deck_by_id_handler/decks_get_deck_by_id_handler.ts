import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { DecksRepository } from '@/modules/decks/repositories/decks_repository';
import {
  DecksGetDeckByIdDto,
  DecksGetDeckByIdOutputDto,
} from '@/modules/decks/dtos/decks_get_deck_by_id_dto';
import { DecksEntityWithStats } from '@/modules/decks/entities/decks_entity';
import { CardsRepository } from '@/modules/cards/repositories/cards_repository';
import { HistoryRepository } from '@/modules/history/repositories/history_repository';

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
  ) {}

  async execute(params: DecksGetDeckByIdDto & { user_id: string }) {
    const deck = await this.decks_repository.find_by_id(params.id);

    if (!deck) {
      throw new NotFoundException('Deck not found');
    }

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

    if (
      deck.deleted_at &&
      params.user_id !== deck.user_id &&
      history.length === 0
    ) {
      throw new NotFoundException('Deck not found');
    }

    const does_user_use_the_deck = history.length > 0;

    // Check visibility
    if (deck.visibility === 'private' && !does_user_use_the_deck) {
      if (deck.user_id !== params.user_id) {
        throw new ForbiddenException('Access denied: This deck is private');
      }
    }

    return { deck: deck_with_stats };
  }
}
