import { Injectable } from '@nestjs/common';
import { HistoryRepository } from '@/modules/history/repositories/history_repository';
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
  constructor(private readonly history_repository: HistoryRepository) {}

  async execute(
    params: history_dtos['get_deck_history']['input'],
  ): Promise<history_dtos['get_deck_history']['output']> {
    return this.history_repository.find_all({
      where: { deck_id: params.deck_id, user_id: params.user_id },
      order: ['last_reviewed_at', 'DESC'],
    });
  }
}
