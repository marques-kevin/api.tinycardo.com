import { BaseRepository } from '@/modules/global/repositories/base_repository';
import { DecksEntity } from '@/modules/decks/entities/decks_entity';

export abstract class DecksRepository extends BaseRepository<DecksEntity> {}
