import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { LessonsRepository } from '@/modules/lessons/repositories/lessons_repository';
import { DecksRepository } from '@/modules/decks/repositories/decks_repository';

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
    private readonly decks_repository: DecksRepository,
  ) {}

  private async does_user_have_access_to_lesson(
    params: lessons_dtos['delete_lesson']['input'],
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
        'Access denied: You can only delete lessons in your own decks',
      );
    }

    return lesson;
  }

  async execute(
    params: lessons_dtos['delete_lesson']['input'],
  ): Promise<lessons_dtos['delete_lesson']['output']> {
    await this.does_user_have_access_to_lesson(params);

    await this.lessons_repository.delete(params.id);
  }
}
