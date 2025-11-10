import { LessonEntity } from '@/modules/lessons/entities/lesson_entity';
import { LessonsController } from '@/modules/lessons/controllers/lessons_controller';
import { LessonsRepository } from '@/modules/lessons/repositories/lessons_repository';
import { LessonsRepositoryPostgres } from '@/modules/lessons/repositories/lessons_repository_postgres';
import { LessonsRepositoryInMemory } from '@/modules/lessons/repositories/lessons_repository_in_memory';
import { LessonsCreateLessonHandler } from '@/modules/lessons/handlers/lessons_create_lesson_handler/lessons_create_lesson_handler';
import { LessonsDeleteLessonHandler } from '@/modules/lessons/handlers/lessons_delete_lesson_handler/lessons_delete_lesson_handler';
import { LessonsGetLessonHandler } from '@/modules/lessons/handlers/lessons_get_lesson_handler/lessons_get_lesson_handler';
import { LessonsReorderLessonsHandler } from '@/modules/lessons/handlers/lessons_reorder_lessons_handler/lessons_reorder_lessons_handler';
import { LessonsGetLessonsHandler } from '@/modules/lessons/handlers/lessons_get_lessons_handler/lessons_get_lessons_handler';
import { LessonsUpsertLessonsHandler } from '@/modules/lessons/handlers/lessons_upsert_lessons_handler/lessons_upsert_lessons_handler';

export const lessons_module = {
  entities: [LessonEntity],
  controllers: [LessonsController],
  handlers: [
    LessonsCreateLessonHandler,
    LessonsUpsertLessonsHandler,
    LessonsDeleteLessonHandler,
    LessonsGetLessonHandler,
    LessonsReorderLessonsHandler,
    LessonsGetLessonsHandler,
  ],
  repositories: [
    {
      provide: LessonsRepository,
      useClass: LessonsRepositoryPostgres,
    },
  ],
};

export const lessons_module_for_tests = {
  ...lessons_module,
  repositories: [
    {
      provide: LessonsRepository,
      useClass: LessonsRepositoryInMemory,
    },
  ],
};
