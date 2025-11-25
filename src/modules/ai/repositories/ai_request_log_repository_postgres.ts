import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepositoryTypeorm } from '@/modules/global/repositories/base_repository_typeorm';
import { AiRequestLogEntity } from '@/modules/ai/entities/ai_request_log_entity';
import { AiRequestLogRepository } from '@/modules/ai/repositories/ai_request_log_repository';

@Injectable()
export class AiRequestLogRepositoryPostgres
  extends BaseRepositoryTypeorm<AiRequestLogEntity>
  implements AiRequestLogRepository
{
  constructor(
    @InjectRepository(AiRequestLogEntity)
    protected readonly repository: Repository<AiRequestLogEntity>,
  ) {
    super();
  }
}
