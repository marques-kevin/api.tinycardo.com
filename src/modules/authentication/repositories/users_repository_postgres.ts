import { BaseRepositoryTypeorm } from '@/modules/global/repositories/base_repository_typeorm';
import { UsersEntity } from '@/modules/authentication/entities/users_entity';
import { Injectable } from '@nestjs/common';
import { UsersRepository } from '@/modules/authentication/repositories/users_repository';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UsersRepositoryPostgres
  extends BaseRepositoryTypeorm<UsersEntity>
  implements UsersRepository
{
  constructor(
    @InjectRepository(UsersEntity)
    protected readonly repository: Repository<UsersEntity>,
  ) {
    super();
  }
}
