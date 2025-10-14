import { UsersRepository } from '@/modules/authentication/repositories/users_repository';
import { BaseRepositoryInMemory } from '@/modules/global/repositories/base_repository_in_memory';
import { UsersEntity } from '@/modules/authentication/entities/users_entity';

export class UsersRepositoryInMemory
  extends BaseRepositoryInMemory<UsersEntity>
  implements UsersRepository
{
  constructor() {
    super();
  }
}
