import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { LessonsRepository } from '@/modules/lessons/repositories/lessons_repository';
import { DecksRepository } from '@/modules/decks/repositories/decks_repository';
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
    private readonly decks_repository: DecksRepository,
  ) {}

  private async does_user_have_access_to_deck(
    user_id: string,
    deck_id: string,
  ) {
    const deck = await this.decks_repository.find_by_id(deck_id);

    if (!deck) {
      throw new NotFoundException('Deck not found');
    }

    if (deck.deleted_at) {
      throw new NotFoundException('Deck not found');
    }

    // Check visibility
    if (deck.visibility === 'private' && deck.user_id !== user_id) {
      throw new ForbiddenException('Access denied: This deck is private');
    }

    return deck;
  }

  async execute(
    params: LessonsGetLessonDto & { user_id: string },
  ): Promise<LessonsGetLessonOutputDto> {
    const lesson = await this.lessons_repository.find_by_id(params.id);

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    await this.does_user_have_access_to_deck(params.user_id, lesson.deck_id);

    return { lesson };
  }
}
