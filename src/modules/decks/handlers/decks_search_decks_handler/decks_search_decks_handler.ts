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
    const skip = (page - 1) * limit;

    // Build the where clause
    const where: Record<string, string | null> = {
      deleted_at: null,
      visibility: 'public',
    };

    if (params.front_language) {
      where.front_language = params.front_language;
    }

    if (params.back_language) {
      where.back_language = params.back_language;
    }

    let all_decks = await this.decks_repository.find_all({
      where,
      order: ['created_at', 'DESC'],
    });

    if (params.title) {
      const title_lower = params.title.toLowerCase();
      all_decks = all_decks.filter((deck) =>
        deck.name.toLowerCase().includes(title_lower),
      );
    }

    const total = all_decks.length;
    const total_pages = Math.ceil(total / limit);

    // Apply pagination
    const decks = all_decks.slice(skip, skip + limit);

    return {
      decks,
      total,
      page,
      limit,
      total_pages,
    };
  }
}
