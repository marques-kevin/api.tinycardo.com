import { Injectable, NotFoundException } from '@nestjs/common';
import { LessonsRepository } from '@/modules/lessons/repositories/lessons_repository';
import { DecksCheckAccessHandler } from '@/modules/decks/handlers/decks_check_access_handler/decks_check_access_handler';
import {
  LessonsGetLessonDto,
  LessonsGetLessonOutputDto,
} from '@/modules/lessons/dtos/lessons_get_lesson_dto';

@Injectable()
export class LessonsGetLessonHandler
  implements
    Handler<
      LessonsGetLessonDto & { user_id: string },
      LessonsGetLessonOutputDto
    >
{
  constructor(
    private readonly lessons_repository: LessonsRepository,
    private readonly decks_check_access_handler: DecksCheckAccessHandler,
  ) {}

  async execute(
    params: LessonsGetLessonDto & { user_id: string },
  ): Promise<LessonsGetLessonOutputDto> {
    const lesson = await this.lessons_repository.find_by_id(params.id);

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    await this.decks_check_access_handler.execute({
      deck_id: lesson.deck_id,
      user_id: params.user_id,
      level: 'all',
    });

    return { lesson };
  }
}
