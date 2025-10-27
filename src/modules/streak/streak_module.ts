import { StreakEntity } from '@/modules/streak/entities/streak_entity';
import { StreakController } from '@/modules/streak/controllers/streak_controller';
import { StreakRepository } from '@/modules/streak/repositories/streak_repository';
import { StreakRepositoryPostgres } from '@/modules/streak/repositories/streak_repository_postgres';
import { StreakRepositoryInMemory } from '@/modules/streak/repositories/streak_repository_in_memory';
import { StreakGetUserStreaksHandler } from '@/modules/streak/handlers/streak_get_user_streaks_handler/streak_get_user_streaks_handler';
import { StreakAddStreakHandler } from '@/modules/streak/handlers/streak_add_streak_handler/streak_add_streak_handler';

export const streak_module = {
  entities: [StreakEntity],
  controllers: [StreakController],
  handlers: [StreakGetUserStreaksHandler, StreakAddStreakHandler],
  repositories: [
    {
      provide: StreakRepository,
      useClass: StreakRepositoryPostgres,
    },
  ],
};

export const streak_module_for_tests = {
  ...streak_module,
  repositories: [
    {
      provide: StreakRepository,
      useClass: StreakRepositoryInMemory,
    },
  ],
};
