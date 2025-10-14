import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepositoryTypeorm } from '@/modules/global/repositories/base_repository_typeorm';
import { HistoryEntity } from '@/modules/history/entities/history_entity';
import { HistoryRepository } from '@/modules/history/repositories/history_repository';

@Injectable()
export class HistoryRepositoryPostgres
  extends BaseRepositoryTypeorm<HistoryEntity>
  implements HistoryRepository
{
  constructor(
    @InjectRepository(HistoryEntity)
    protected readonly repository: Repository<HistoryEntity>,
  ) {
    super();
  }
}
