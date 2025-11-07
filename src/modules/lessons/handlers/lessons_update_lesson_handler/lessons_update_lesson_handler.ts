import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { LessonsRepository } from '@/modules/lessons/repositories/lessons_repository';
import { DecksRepository } from '@/modules/decks/repositories/decks_repository';
import { LessonEntity } from '@/modules/lessons/entities/lesson_entity';
import { LessonsUpdateLessonDto } from '@/modules/lessons/dtos/lessons_update_lesson_dto';

type lessons_dtos = {
  update_lesson: {
    input: LessonsUpdateLessonDto & { user_id: string };
    output: LessonEntity;
  };
};

@Injectable()
export class LessonsUpdateLessonHandler
  implements
    Handler<
      lessons_dtos['update_lesson']['input'],
      lessons_dtos['update_lesson']['output']
    >
{
  constructor(
    private readonly lessons_repository: LessonsRepository,
    private readonly decks_repository: DecksRepository,
  ) {}

  private async does_user_have_access_to_lesson(
    params: lessons_dtos['update_lesson']['input'],
  ) {
    const lesson = await this.lessons_repository.find_by_id(params.id);

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    const deck = await this.decks_repository.find_by_id(lesson.deck_id);

    if (!deck || deck.deleted_at) {
      throw new NotFoundException('Deck not found');
    }

    if (deck.user_id !== params.user_id) {
      throw new ForbiddenException(
        'Access denied: You can only update lessons in your own decks',
      );
    }

    return lesson;
  }

  async execute(
    params: lessons_dtos['update_lesson']['input'],
  ): Promise<lessons_dtos['update_lesson']['output']> {
    const existing = await this.does_user_have_access_to_lesson(params);

    const updated: LessonEntity = {
      ...existing,
      name: params.name ?? existing.name,
      position: params.position ?? existing.position,
      cards: params.cards ?? existing.cards,
      updated_at: new Date(),
    };

    return this.lessons_repository.save(updated);
  }
}
