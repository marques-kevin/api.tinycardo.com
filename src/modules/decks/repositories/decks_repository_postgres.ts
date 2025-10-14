import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepositoryTypeorm } from '@/modules/global/repositories/base_repository_typeorm';
import { DecksEntity } from '@/modules/decks/entities/decks_entity';
import { DecksRepository } from '@/modules/decks/repositories/decks_repository';

@Injectable()
export class DecksRepositoryPostgres
  extends BaseRepositoryTypeorm<DecksEntity>
  implements DecksRepository
{
  constructor(
    @InjectRepository(DecksEntity)
    protected readonly repository: Repository<DecksEntity>,
  ) {
    super();
  }
}
