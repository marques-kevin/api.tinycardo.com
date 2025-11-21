import { Injectable } from '@nestjs/common';
import { LessonsRepository } from '@/modules/lessons/repositories/lessons_repository';
import { DecksCheckAccessHandler } from '@/modules/decks/handlers/decks_check_access_handler/decks_check_access_handler';
import { v4 } from 'uuid';
import { LessonEntity } from '@/modules/lessons/entities/lesson_entity';
import { LessonsCreateLessonDto } from '@/modules/lessons/dtos/lessons_create_lesson_dto';

type lessons_dtos = {
  create_lesson: {
    input: LessonsCreateLessonDto & { user_id: string };
    output: LessonEntity;
  };
};

@Injectable()
export class LessonsCreateLessonHandler
  implements
    Handler<
      lessons_dtos['create_lesson']['input'],
      lessons_dtos['create_lesson']['output']
    >
{
  constructor(
    private readonly lessons_repository: LessonsRepository,
    private readonly decks_check_access_handler: DecksCheckAccessHandler,
  ) {}

  async execute(
    params: lessons_dtos['create_lesson']['input'],
  ): Promise<lessons_dtos['create_lesson']['output']> {
    await this.decks_check_access_handler.execute({
      deck_id: params.deck_id,
      user_id: params.user_id,
      level: 'owner',
    });

    const lesson: LessonEntity = {
      id: v4(),
      name: params.name,
      deck_id: params.deck_id,
      position: params.position,
      cards: params.cards || [],
      created_at: new Date(),
      updated_at: new Date(),
    };

    return this.lessons_repository.save(lesson);
  }
}
