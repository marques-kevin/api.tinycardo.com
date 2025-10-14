import { BaseRepository } from '@/modules/global/repositories/base_repository';
import { HistoryEntity } from '@/modules/history/entities/history_entity';

export abstract class HistoryRepository extends BaseRepository<HistoryEntity> {}
