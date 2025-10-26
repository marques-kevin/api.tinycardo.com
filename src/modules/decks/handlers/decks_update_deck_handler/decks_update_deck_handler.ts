import { Injectable } from '@nestjs/common';
import { DecksRepository } from '@/modules/decks/repositories/decks_repository';
import { DecksEntity } from '@/modules/decks/entities/decks_entity';
import { DecksUpdateDeckDto } from '@/modules/decks/dtos/decks_update_deck_dto';

type decks_dtos = {
  update_deck: {
    input: DecksUpdateDeckDto & { user_id: string };
    output: DecksEntity;
  };
};

@Injectable()
export class DecksUpdateDeckHandler
  implements
    Handler<
      decks_dtos['update_deck']['input'],
      decks_dtos['update_deck']['output']
    >
{
  constructor(private readonly decks_repository: DecksRepository) {}

  private async does_user_have_access_to_deck(
    params: decks_dtos['update_deck']['input'],
  ) {
    const deck = await this.decks_repository.find_by_id(params.id);

    if (!deck || deck.user_id !== params.user_id) {
      throw new Error('Deck not found');
    }

    return deck;
  }

  async execute(
    params: decks_dtos['update_deck']['input'],
  ): Promise<decks_dtos['update_deck']['output']> {
    const existing = await this.does_user_have_access_to_deck(params);

    const updated: DecksEntity = {
      ...existing,
      name: params.name ?? existing.name,
      front_language: params.front_language ?? existing.front_language,
      back_language: params.back_language ?? existing.back_language,
      description: params.description ?? existing.description,
      visibility: params.visibility ?? existing.visibility,
      updated_at: new Date(),
    };

    return this.decks_repository.save(updated);
  }
}
