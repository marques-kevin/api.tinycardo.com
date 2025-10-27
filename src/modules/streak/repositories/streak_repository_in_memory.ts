import { BaseRepositoryInMemory } from '@/modules/global/repositories/base_repository_in_memory';
import { StreakRepository } from '@/modules/streak/repositories/streak_repository';
import { StreakEntity } from '@/modules/streak/entities/streak_entity';

export class StreakRepositoryInMemory
  extends BaseRepositoryInMemory<StreakEntity>
  implements StreakRepository {}
