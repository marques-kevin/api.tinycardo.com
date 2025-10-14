import { Injectable } from '@nestjs/common';
import { DecksRepository } from '@/modules/decks/repositories/decks_repository';
import { DecksEntity } from '@/modules/decks/entities/decks_entity';

type decks_dtos = {
  get_decks: {
    input: { user_id: string; take?: number; skip?: number };
    output: DecksEntity[];
  };
};

@Injectable()
export class DecksGetDecksHandler
  implements
    Handler<decks_dtos['get_decks']['input'], decks_dtos['get_decks']['output']>
{
  constructor(private readonly decks_repository: DecksRepository) {}

  async execute(
    params: decks_dtos['get_decks']['input'],
  ): Promise<decks_dtos['get_decks']['output']> {
    return this.decks_repository.find_all({
      where: { user_id: params.user_id, deleted_at: null },
      order: ['created_at', 'DESC'],
      take: params.take,
      skip: params.skip,
    });
  }
}
