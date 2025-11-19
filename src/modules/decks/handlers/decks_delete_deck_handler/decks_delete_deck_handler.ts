import { Injectable } from '@nestjs/common';
import { DecksRepository } from '@/modules/decks/repositories/decks_repository';
import { DecksCheckAccessHandler } from '@/modules/decks/handlers/decks_check_access_handler/decks_check_access_handler';

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
  constructor(
    private readonly decks_repository: DecksRepository,
    private readonly decks_check_access_handler: DecksCheckAccessHandler,
  ) {}

  async execute(
    params: decks_dtos['delete_deck']['input'],
  ): Promise<decks_dtos['delete_deck']['output']> {
    const { deck } = await this.decks_check_access_handler.execute({
      deck_id: params.id,
      user_id: params.user_id,
      level: 'owner',
    });

    await this.decks_repository.save({
      ...deck,
      deleted_at: new Date(),
    });
  }
}
