import { AiRequestLogEntity } from '@/modules/ai/entities/ai_request_log_entity';
import { AiRequestHandler } from '@/modules/ai/handlers/ai_request_handler/ai_request_handler';
import { AiRequestLogRepository } from '@/modules/ai/repositories/ai_request_log_repository';
import { AiRequestLogRepositoryPostgres } from '@/modules/ai/repositories/ai_request_log_repository_postgres';
import { AiRequestLogRepositoryInMemory } from '@/modules/ai/repositories/ai_request_log_repository_in_memory';

export const ai_module = {
  entities: [AiRequestLogEntity],
  handlers: [AiRequestHandler],
  repositories: [
    {
      provide: AiRequestLogRepository,
      useClass: AiRequestLogRepositoryPostgres,
    },
  ],
};

export const ai_module_for_tests = {
  ...ai_module,
  repositories: [
    {
      provide: AiRequestLogRepository,
      useClass: AiRequestLogRepositoryInMemory,
    },
  ],
};
