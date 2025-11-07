import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepositoryTypeorm } from '@/modules/global/repositories/base_repository_typeorm';
import { LessonEntity } from '@/modules/lessons/entities/lesson_entity';
import { LessonsRepository } from '@/modules/lessons/repositories/lessons_repository';

@Injectable()
export class LessonsRepositoryPostgres
  extends BaseRepositoryTypeorm<LessonEntity>
  implements LessonsRepository
{
  constructor(
    @InjectRepository(LessonEntity)
    protected readonly repository: Repository<LessonEntity>,
  ) {
    super();
  }
}
