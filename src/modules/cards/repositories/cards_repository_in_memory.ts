import { BaseRepositoryInMemory } from '@/modules/global/repositories/base_repository_in_memory';
import { CardsRepository } from '@/modules/cards/repositories/cards_repository';
import { CardsEntity } from '@/modules/cards/entities/cards_entity';

export class CardsRepositoryInMemory
  extends BaseRepositoryInMemory<CardsEntity>
  implements CardsRepository {}
