import { BaseRepository } from '@/modules/global/repositories/base_repository';
import { LessonEntity } from '@/modules/lessons/entities/lesson_entity';

export abstract class LessonsRepository extends BaseRepository<LessonEntity> {}
