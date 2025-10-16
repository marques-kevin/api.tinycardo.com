import { Injectable } from '@nestjs/common';
import { CardsRepository } from '@/modules/cards/repositories/cards_repository';
import { DecksRepository } from '@/modules/decks/repositories/decks_repository';
import { CardsEntity } from '@/modules/cards/entities/cards_entity';

type cards_dtos = {
  update_card: {
    input: {
      user_id: string;
      card_id: string;
      front?: string;
      back?: string;
    };
    output: CardsEntity;
  };
};

@Injectable()
export class CardsUpdateCardHandler
  implements
    Handler<
      cards_dtos['update_card']['input'],
      cards_dtos['update_card']['output']
    >
{
  constructor(
    private readonly cards_repository: CardsRepository,
    private readonly decks_repository: DecksRepository,
  ) {}

  private async does_user_have_access_to_card(
    user_id: string,
    card_id: string,
  ) {
    const card = await this.cards_repository.find_by_id(card_id);

    if (!card) {
      throw new Error('Card not found');
    }

    const deck = await this.decks_repository.find_by_id(card.deck_id);

    if (!deck || deck.user_id !== user_id || deck.deleted_at) {
      throw new Error('Card not found');
    }

    return card;
  }

  async execute(
    params: cards_dtos['update_card']['input'],
  ): Promise<cards_dtos['update_card']['output']> {
    const existing = await this.does_user_have_access_to_card(
      params.user_id,
      params.card_id,
    );

    const updated: CardsEntity = {
      ...existing,
      front: params.front ?? existing.front,
      back: params.back ?? existing.back,
      updated_at: new Date(),
    };

    return this.cards_repository.save(updated);
  }
}
