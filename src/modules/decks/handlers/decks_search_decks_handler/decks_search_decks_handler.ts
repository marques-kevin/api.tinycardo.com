import { Injectable } from '@nestjs/common';
import { DecksRepository } from '@/modules/decks/repositories/decks_repository';
import {
  DecksEntity,
  DecksEntityWithStats,
} from '@/modules/decks/entities/decks_entity';
import { DecksSearchDecksOutputDto } from '@/modules/decks/dtos/decks_search_decks_dto';

type decks_dtos = {
  search_decks: {
    input: {
      limit?: number;
      page?: number;
      front_language?: string;
      back_language?: string;
      title?: string;
      user_id: string;
    };
    output: DecksSearchDecksOutputDto;
  };
};

@Injectable()
export class DecksSearchDecksHandler
  implements
    Handler<
      decks_dtos['search_decks']['input'],
      decks_dtos['search_decks']['output']
    >
{
  constructor(private readonly decks_repository: DecksRepository) {}

  private async enrich_with_stats(params: {
    decks: DecksEntity[];
  }): Promise<DecksEntityWithStats[]> {
    const decks_stats = await this.decks_repository.get_decks_stats({
      deck_ids: params.decks.map((deck) => deck.id),
    });

    return params.decks.map((deck) => {
      const deck_stats = decks_stats.find((s) => s.deck_id === deck.id);
      return {
        ...deck,
        number_of_users_who_use_the_deck: deck_stats?.user_count || 0,
        number_of_cards: deck_stats?.card_count || 0,
        number_of_cards_ready_to_be_reviewed: 0,
        number_of_cards_not_ready_to_be_reviewed: 0,
      };
    });
  }

  async execute(
    params: decks_dtos['search_decks']['input'],
  ): Promise<decks_dtos['search_decks']['output']> {
    const limit = params.limit && params.limit > 0 ? params.limit : 10;
    const page = params.page && params.page > 0 ? params.page : 1;
    const { decks, total } = await this.decks_repository.search({
      limit,
      page,
      exclude_user_id: params.user_id,
      front_language: params.front_language,
      back_language: params.back_language,
      title: params.title,
    });

    return {
      decks: await this.enrich_with_stats({ decks }),
      total,
      page,
      limit,
    };
  }
}
