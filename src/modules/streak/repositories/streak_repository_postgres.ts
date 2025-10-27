import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepositoryTypeorm } from '@/modules/global/repositories/base_repository_typeorm';
import { StreakEntity } from '@/modules/streak/entities/streak_entity';
import { StreakRepository } from '@/modules/streak/repositories/streak_repository';

@Injectable()
export class StreakRepositoryPostgres
  extends BaseRepositoryTypeorm<StreakEntity>
  implements StreakRepository
{
  constructor(
    @InjectRepository(StreakEntity)
    protected readonly repository: Repository<StreakEntity>,
  ) {
    super();
  }
}
