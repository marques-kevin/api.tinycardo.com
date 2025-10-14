import { Injectable } from '@nestjs/common';
import { DecksRepository } from '@/modules/decks/repositories/decks_repository';

type decks_dtos = {
  delete_deck: {
    input: {
      id: string;
      user_id: string;
    };
    output: void;
  };
};

@Injectable()
export class DecksDeleteDeckHandler
  implements
    Handler<
      decks_dtos['delete_deck']['input'],
      decks_dtos['delete_deck']['output']
    >
{
  constructor(private readonly decks_repository: DecksRepository) {}

  private async does_user_have_access_to_deck(
    params: decks_dtos['delete_deck']['input'],
  ) {
    const deck = await this.decks_repository.find_by_id(params.id);

    if (!deck || deck.user_id !== params.user_id) {
      throw new Error('Deck not found');
    }

    return deck;
  }

  async execute(
    params: decks_dtos['delete_deck']['input'],
  ): Promise<decks_dtos['delete_deck']['output']> {
    const deck = await this.does_user_have_access_to_deck(params);

    await this.decks_repository.save({
      ...deck,
      deleted_at: new Date(),
    });
  }
}
