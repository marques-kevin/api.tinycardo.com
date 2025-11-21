import { Injectable, NotFoundException } from '@nestjs/common';
import { LessonsRepository } from '@/modules/lessons/repositories/lessons_repository';
import { DecksCheckAccessHandler } from '@/modules/decks/handlers/decks_check_access_handler/decks_check_access_handler';

type lessons_dtos = {
  delete_lesson: {
    input: {
      id: string;
      user_id: string;
    };
    output: void;
  };
};

@Injectable()
export class LessonsDeleteLessonHandler
  implements
    Handler<
      lessons_dtos['delete_lesson']['input'],
      lessons_dtos['delete_lesson']['output']
    >
{
  constructor(
    private readonly lessons_repository: LessonsRepository,
    private readonly decks_check_access_handler: DecksCheckAccessHandler,
  ) {}

  async execute(
    params: lessons_dtos['delete_lesson']['input'],
  ): Promise<lessons_dtos['delete_lesson']['output']> {
    const lesson = await this.lessons_repository.find_by_id(params.id);

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    await this.decks_check_access_handler.execute({
      deck_id: lesson.deck_id,
      user_id: params.user_id,
      level: 'owner',
    });

    await this.lessons_repository.delete(params.id);
  }
}
