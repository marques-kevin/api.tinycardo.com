import { Injectable } from '@nestjs/common';
import { HistoryRepository } from '@/modules/history/repositories/history_repository';
import { DecksRepository } from '@/modules/decks/repositories/decks_repository';
import { HistoryEntity } from '@/modules/history/entities/history_entity';

type history_dtos = {
  get_deck_history: {
    input: {
      user_id: string;
      deck_id: string;
    };
    output: HistoryEntity[];
  };
};

@Injectable()
export class HistoryGetDeckHistoryHandler
  implements
    Handler<
      history_dtos['get_deck_history']['input'],
      history_dtos['get_deck_history']['output']
    >
{
  constructor(
    private readonly history_repository: HistoryRepository,
    private readonly decks_repository: DecksRepository,
  ) {}

  private async validate_user_owns_deck(
    user_id: string,
    deck_id: string,
  ): Promise<void> {
    const deck = await this.decks_repository.find_by_id(deck_id);

    if (!deck || deck.user_id !== user_id || deck.deleted_at) {
      throw new Error('Deck not found');
    }
  }

  async execute(
    params: history_dtos['get_deck_history']['input'],
  ): Promise<history_dtos['get_deck_history']['output']> {
    await this.validate_user_owns_deck(params.user_id, params.deck_id);

    return this.history_repository.find_all({
      where: { deck_id: params.deck_id, user_id: params.user_id },
      order: ['last_reviewed_at', 'DESC'],
    });
  }
}
