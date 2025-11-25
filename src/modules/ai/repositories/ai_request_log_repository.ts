import { BaseRepository } from '@/modules/global/repositories/base_repository';
import { AiRequestLogEntity } from '@/modules/ai/entities/ai_request_log_entity';

export abstract class AiRequestLogRepository extends BaseRepository<AiRequestLogEntity> {}
