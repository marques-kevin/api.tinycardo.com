import { BaseRepository } from '@/modules/global/repositories/base_repository';
import { CardsEntity } from '@/modules/cards/entities/cards_entity';

export abstract class CardsRepository extends BaseRepository<CardsEntity> {}
