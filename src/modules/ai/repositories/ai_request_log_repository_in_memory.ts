import { BaseRepositoryInMemory } from '@/modules/global/repositories/base_repository_in_memory';
import { AiRequestLogRepository } from '@/modules/ai/repositories/ai_request_log_repository';
import { AiRequestLogEntity } from '@/modules/ai/entities/ai_request_log_entity';

export class AiRequestLogRepositoryInMemory
  extends BaseRepositoryInMemory<AiRequestLogEntity>
  implements AiRequestLogRepository {}
