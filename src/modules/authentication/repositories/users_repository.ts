import { UsersEntity } from '@/modules/authentication/entities/users_entity';
import { BaseRepository } from '@/modules/global/repositories/base_repository';

export abstract class UsersRepository extends BaseRepository<UsersEntity> {}
