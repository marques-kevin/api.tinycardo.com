import { Injectable } from '@nestjs/common';
import { CardsRepository } from '@/modules/cards/repositories/cards_repository';
import { DecksRepository } from '@/modules/decks/repositories/decks_repository';
import { CardsEntity } from '@/modules/cards/entities/cards_entity';
import { v4 } from 'uuid';

type decks_dtos = {
  upsert_cards: {
    input: {
      user_id: string;
      deck_id: string;
      cards: Array<{ id?: string; front: string; back: string }>;
    };
    output: { cards_saved: number; cards_removed: number };
  };
};

@Injectable()
export class DecksUpsertCardsHandler
  implements
    Handler<
      decks_dtos['upsert_cards']['input'],
      decks_dtos['upsert_cards']['output']
    >
{
  constructor(
    private readonly decks_repository: DecksRepository,
    private readonly cards_repository: CardsRepository,
  ) {}

  private async does_user_have_access_to_deck(
    params: decks_dtos['upsert_cards']['input'],
  ) {
    const deck = await this.decks_repository.find_by_id(params.deck_id);

    if (!deck || deck.user_id !== params.user_id) {
      throw new Error('Deck not found');
    }

    return deck;
  }

  async execute(
    params: decks_dtos['upsert_cards']['input'],
  ): Promise<decks_dtos['upsert_cards']['output']> {
    await this.does_user_have_access_to_deck(params);
    const existing_cards = await this.cards_repository.find_all({
      where: { deck_id: params.deck_id },
    });

    const cards_to_remove: CardsEntity[] = [];
    const cards_to_save: CardsEntity[] = [];

    for (const card of params.cards) {
      const existing = existing_cards.find((c) => c.id === card.id);

      const card_to_save: CardsEntity = {
        id: existing ? existing.id : v4(),
        deck_id: params.deck_id,
        front: card.front,
        back: card.back,
        created_at: existing ? existing.created_at : new Date(),
        updated_at: new Date(),
      };

      cards_to_save.push(card_to_save);
    }

    for (const card of existing_cards) {
      if (!params.cards.find((c) => c.id === card.id)) {
        cards_to_remove.push(card);
      }
    }

    for (const card of cards_to_save) {
      await this.cards_repository.save(card);
    }

    for (const card of cards_to_remove) {
      await this.cards_repository.delete(card.id);
    }

    return {
      cards_saved: cards_to_save.length,
      cards_removed: cards_to_remove.length,
    };
  }
}
