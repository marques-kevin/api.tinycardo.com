import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepositoryTypeorm } from '@/modules/global/repositories/base_repository_typeorm';
import { CardsEntity } from '@/modules/cards/entities/cards_entity';
import { CardsRepository } from '@/modules/cards/repositories/cards_repository';

@Injectable()
export class CardsRepositoryPostgres
  extends BaseRepositoryTypeorm<CardsEntity>
  implements CardsRepository
{
  constructor(
    @InjectRepository(CardsEntity)
    protected readonly repository: Repository<CardsEntity>,
  ) {
    super();
  }
}
