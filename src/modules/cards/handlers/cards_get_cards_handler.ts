import { Injectable } from '@nestjs/common';
import { CardsRepository } from '@/modules/cards/repositories/cards_repository';
import { DecksRepository } from '@/modules/decks/repositories/decks_repository';
import { CardsEntity } from '@/modules/cards/entities/cards_entity';

type cards_dtos = {
  get_cards: {
    input: {
      user_id: string;
      deck_id: string;
    };
    output: CardsEntity[];
  };
};

@Injectable()
export class CardsGetCardsHandler
  implements
    Handler<cards_dtos['get_cards']['input'], cards_dtos['get_cards']['output']>
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
    params: cards_dtos['get_cards']['input'],
  ): Promise<cards_dtos['get_cards']['output']> {
    await this.does_user_have_access_to_deck(params.user_id, params.deck_id);

    return this.cards_repository.find_all({
      where: { deck_id: params.deck_id },
      order: ['created_at', 'ASC'],
    });
  }
}
