import { BaseRepositoryInMemory } from '@/modules/global/repositories/base_repository_in_memory';
import { LessonsRepository } from '@/modules/lessons/repositories/lessons_repository';
import { LessonEntity } from '@/modules/lessons/entities/lesson_entity';

export class LessonsRepositoryInMemory
  extends BaseRepositoryInMemory<LessonEntity>
  implements LessonsRepository {}
