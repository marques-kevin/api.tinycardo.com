import { Injectable } from '@nestjs/common';
import { HistoryRepository } from '@/modules/history/repositories/history_repository';
import { CardsRepository } from '@/modules/cards/repositories/cards_repository';
import { HistoryEntity } from '@/modules/history/entities/history_entity';
import {
  history_due_date_algorithm,
  BASE_EASE_FACTOR,
} from '@/modules/history/utils/history_due_date_algorithm';
import { v4 } from 'uuid';

type history_dtos = {
  review_card: {
    input: {
      user_id: string;
      card_id: string;
      status: 'known' | 'unknown';
    };
    output: HistoryEntity;
  };
};

@Injectable()
export class HistoryReviewCardHandler
  implements
    Handler<
      history_dtos['review_card']['input'],
      history_dtos['review_card']['output']
    >
{
  constructor(
    private readonly history_repository: HistoryRepository,
    private readonly cards_repository: CardsRepository,
  ) {}

  private async validate_card_exists(card_id: string): Promise<void> {
    const card = await this.cards_repository.find_by_id(card_id);
    if (!card) {
      throw new Error('Card not found');
    }
  }

  private async get_or_create_history(
    card_id: string,
    user_id: string,
  ): Promise<HistoryEntity> {
    const existing_history = await this.history_repository.find_all({
      where: { card_id, user_id },
    });

    if (existing_history.length > 0) {
      return existing_history[0];
    }

    // Get the card to retrieve deck_id
    const card = await this.cards_repository.find_by_id(card_id);

    // Create a new history record with default values
    const now = new Date();
    const new_history: HistoryEntity = {
      id: v4(),
      user_id,
      deck_id: card!.deck_id,
      card_id,
      repetition_count: 0,
      ease_factor: BASE_EASE_FACTOR,
      next_due_at: now,
      last_reviewed_at: now,
      created_at: now,
      updated_at: now,
    };

    return new_history;
  }

  async execute(
    params: history_dtos['review_card']['input'],
  ): Promise<history_dtos['review_card']['output']> {
    await this.validate_card_exists(params.card_id);

    const history = await this.get_or_create_history(
      params.card_id,
      params.user_id,
    );

    const updated_history = history_due_date_algorithm({
      history,
      status: params.status,
    });

    return this.history_repository.save(updated_history);
  }
}
