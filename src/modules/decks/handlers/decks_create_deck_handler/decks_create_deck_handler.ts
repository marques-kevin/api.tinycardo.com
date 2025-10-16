import { Injectable } from '@nestjs/common';
import { DecksRepository } from '@/modules/decks/repositories/decks_repository';
import { v4 } from 'uuid';
import { DecksEntity } from '@/modules/decks/entities/decks_entity';

type decks_dtos = {
  create_deck: {
    input: {
      user_id: string;
      name: string;
      front_language: string;
      back_language: string;
    };
    output: DecksEntity;
  };
};

@Injectable()
export class DecksCreateDeckHandler
  implements
    Handler<
      decks_dtos['create_deck']['input'],
      decks_dtos['create_deck']['output']
    >
{
  constructor(private readonly decks_repository: DecksRepository) {}

  async execute(
    params: decks_dtos['create_deck']['input'],
  ): Promise<decks_dtos['create_deck']['output']> {
    const deck: DecksEntity = {
      id: v4(),
      user_id: params.user_id,
      name: params.name,
      front_language: params.front_language,
      back_language: params.back_language,
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: null,
    };

    return this.decks_repository.save(deck);
  }
}
