import { Injectable } from '@nestjs/common';
import { CardsRepository } from '@/modules/cards/repositories/cards_repository';
import { DecksRepository } from '@/modules/decks/repositories/decks_repository';
import { CardsEntity } from '@/modules/cards/entities/cards_entity';
import { v4 } from 'uuid';

type cards_dtos = {
  create_card: {
    input: {
      user_id: string;
      deck_id: string;
      front: string;
      back: string;
    };
    output: CardsEntity;
  };
};

@Injectable()
export class CardsCreateCardHandler
  implements
    Handler<
      cards_dtos['create_card']['input'],
      cards_dtos['create_card']['output']
    >
{
  constructor(
    private readonly cards_repository: CardsRepository,
    private readonly decks_repository: DecksRepository,
  ) {}

  private async does_user_have_access_to_deck(
    user_id: string,
    deck_id: string,
  ) {
    const deck = await this.decks_repository.find_by_id(deck_id);

    if (!deck || deck.user_id !== user_id || deck.deleted_at) {
      throw new Error('Deck not found');
    }

    return deck;
  }

  async execute(
    params: cards_dtos['create_card']['input'],
  ): Promise<cards_dtos['create_card']['output']> {
    await this.does_user_have_access_to_deck(params.user_id, params.deck_id);

    const card: CardsEntity = {
      id: v4(),
      deck_id: params.deck_id,
      front: params.front,
      back: params.back,
      created_at: new Date(),
      updated_at: new Date(),
    };

    return this.cards_repository.save(card);
  }
}
