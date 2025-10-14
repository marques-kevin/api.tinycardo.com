import { BaseRepositoryInMemory } from '@/modules/global/repositories/base_repository_in_memory';
import { HistoryRepository } from '@/modules/history/repositories/history_repository';
import { HistoryEntity } from '@/modules/history/entities/history_entity';

export class HistoryRepositoryInMemory
  extends BaseRepositoryInMemory<HistoryEntity>
  implements HistoryRepository {}
