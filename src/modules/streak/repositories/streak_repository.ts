import { BaseRepository } from '@/modules/global/repositories/base_repository';
import { StreakEntity } from '@/modules/streak/entities/streak_entity';

export abstract class StreakRepository extends BaseRepository<StreakEntity> {}
