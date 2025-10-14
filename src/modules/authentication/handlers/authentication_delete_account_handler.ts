import { Injectable } from '@nestjs/common';
import { UsersRepository } from '@/modules/authentication/repositories/users_repository';
import { DecksRepository } from '@/modules/decks/repositories/decks_repository';

type authentication_dtos = {
  delete_account: {
    input: {
      user_id: string;
    };
    output: void;
  };
};

@Injectable()
export class AuthenticationDeleteAccountHandler
  implements
    Handler<
      authentication_dtos['delete_account']['input'],
      authentication_dtos['delete_account']['output']
    >
{
  constructor(
    private readonly users_repository: UsersRepository,
    private readonly decks_repository: DecksRepository,
  ) {}

  async execute(
    params: authentication_dtos['delete_account']['input'],
  ): Promise<authentication_dtos['delete_account']['output']> {
    // First, transfer all user's decks to the "archived" user
    const user_decks = await this.decks_repository.find_all({
      where: { user_id: params.user_id },
    });

    for (const deck of user_decks) {
      await this.decks_repository.save({
        ...deck,
        user_id: 'archived',
        deleted_at: new Date(),
      });
    }

    // Then delete the user account
    await this.users_repository.delete(params.user_id);
  }
}
