import { HistoryEntity } from '@/modules/history/entities/history_entity';
import { HistoryController } from '@/modules/history/controllers/history_controller';
import { HistoryRepository } from '@/modules/history/repositories/history_repository';
import { HistoryRepositoryPostgres } from '@/modules/history/repositories/history_repository_postgres';
import { HistoryRepositoryInMemory } from '@/modules/history/repositories/history_repository_in_memory';
import { HistoryReviewCardHandler } from '@/modules/history/handlers/history_review_card_handler';
import { HistoryGetDeckHistoryHandler } from '@/modules/history/handlers/history_get_deck_history_handler';

export const history_module = {
  entities: [HistoryEntity],
  controllers: [HistoryController],
  handlers: [HistoryReviewCardHandler, HistoryGetDeckHistoryHandler],
  repositories: [
    {
      provide: HistoryRepository,
      useClass: HistoryRepositoryPostgres,
    },
  ],
};

export const history_module_for_tests = {
  ...history_module,
  repositories: [
    {
      provide: HistoryRepository,
      useClass: HistoryRepositoryInMemory,
    },
  ],
};
