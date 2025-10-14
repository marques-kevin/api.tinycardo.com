import { BaseRepositoryInMemory } from '@/modules/global/repositories/base_repository_in_memory';
import { DecksRepository } from '@/modules/decks/repositories/decks_repository';
import { DecksEntity } from '@/modules/decks/entities/decks_entity';

export class DecksRepositoryInMemory
  extends BaseRepositoryInMemory<DecksEntity>
  implements DecksRepository {}
