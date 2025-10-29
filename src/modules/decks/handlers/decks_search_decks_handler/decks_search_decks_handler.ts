import { Injectable } from '@nestjs/common';
import { DecksRepository } from '@/modules/decks/repositories/decks_repository';
import { DecksEntity } from '@/modules/decks/entities/decks_entity';

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
    output: {
      decks: DecksEntity[];
      total: number;
      page: number;
      limit: number;
      total_pages: number;
    };
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

    const total_pages = Math.ceil(total / limit);

    return {
      decks,
      total,
      page,
      limit,
      total_pages,
    };
  }
}
