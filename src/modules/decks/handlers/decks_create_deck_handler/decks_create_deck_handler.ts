import { Injectable } from '@nestjs/common';
import { DecksRepository } from '@/modules/decks/repositories/decks_repository';
import { v4 } from 'uuid';
import { DecksEntity } from '@/modules/decks/entities/decks_entity';
import { DecksCreateDeckDto } from '@/modules/decks/dtos/decks_create_deck_dto';

type decks_dtos = {
  create_deck: {
    input: DecksCreateDeckDto & { user_id: string };
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
      description: params.description || '',
      visibility: params.visibility,
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
