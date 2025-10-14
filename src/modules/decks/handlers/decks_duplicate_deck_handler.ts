import { Injectable } from '@nestjs/common';
import { DecksRepository } from '@/modules/decks/repositories/decks_repository';
import { CardsRepository } from '@/modules/cards/repositories/cards_repository';
import { DecksEntity } from '@/modules/decks/entities/decks_entity';
import { v4 } from 'uuid';

type decks_dtos = {
  duplicate_deck: {
    input: {
      user_id: string;
      deck_id: string;
    };
    output: DecksEntity;
  };
};

@Injectable()
export class DecksDuplicateDeckHandler
  implements
    Handler<
      decks_dtos['duplicate_deck']['input'],
      decks_dtos['duplicate_deck']['output']
    >
{
  constructor(
    private readonly decks_repository: DecksRepository,
    private readonly cards_repository: CardsRepository,
  ) {}

  private async get_deck_to_duplicate(deck_id: string) {
    const deck = await this.decks_repository.find_by_id(deck_id);

    if (!deck || deck.deleted_at) {
      throw new Error('Deck not found');
    }

    return deck;
  }

  async execute(
    params: decks_dtos['duplicate_deck']['input'],
  ): Promise<decks_dtos['duplicate_deck']['output']> {
    const original_deck = await this.get_deck_to_duplicate(params.deck_id);

    // Create a new deck with the same properties but new ID and owner
    const new_deck: DecksEntity = {
      id: v4(),
      name: `${original_deck.name} (Copy)`,
      user_id: params.user_id,
      front_language: original_deck.front_language,
      back_language: original_deck.back_language,
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: null,
    };

    const saved_deck = await this.decks_repository.save(new_deck);

    // Duplicate all cards from the original deck
    const original_cards = await this.cards_repository.find_all({
      where: { deck_id: params.deck_id },
    });

    for (const card of original_cards) {
      await this.cards_repository.save({
        id: v4(),
        deck_id: saved_deck.id,
        front: card.front,
        back: card.back,
        created_at: new Date(),
        updated_at: new Date(),
      });
    }

    return saved_deck;
  }
}
