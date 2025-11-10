import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { LessonsRepository } from '@/modules/lessons/repositories/lessons_repository';
import { DecksRepository } from '@/modules/decks/repositories/decks_repository';
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

    if (deck.user_id !== user_id) {
      throw new ForbiddenException(
        'Access denied: You can only create lessons for your own decks',
      );
    }

    return deck;
  }

  async execute(
    params: lessons_dtos['create_lesson']['input'],
  ): Promise<lessons_dtos['create_lesson']['output']> {
    await this.does_user_have_access_to_deck(params.user_id, params.deck_id);

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
