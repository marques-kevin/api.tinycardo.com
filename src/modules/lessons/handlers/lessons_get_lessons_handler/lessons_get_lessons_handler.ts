import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { LessonsRepository } from '@/modules/lessons/repositories/lessons_repository';
import { DecksRepository } from '@/modules/decks/repositories/decks_repository';
import {
  LessonsGetLessonsDto,
  LessonsGetLessonsOutputDto,
} from '@/modules/lessons/dtos/lessons_get_lessons_dto';

type lessons_dtos = {
  get_lessons: {
    input: LessonsGetLessonsDto & { user_id: string };
    output: LessonsGetLessonsOutputDto;
  };
};

@Injectable()
export class LessonsGetLessonsHandler
  implements
    Handler<
      lessons_dtos['get_lessons']['input'],
      lessons_dtos['get_lessons']['output']
    >
{
  constructor(
    private readonly lessons_repository: LessonsRepository,
    private readonly decks_repository: DecksRepository,
  ) {}

  private async ensure_user_can_access_deck(user_id: string, deck_id: string) {
    const deck = await this.decks_repository.find_by_id(deck_id);

    if (!deck) {
      throw new NotFoundException('Deck not found');
    }

    if (deck.deleted_at) {
      throw new NotFoundException('Deck not found');
    }

    if (deck.visibility === 'private' && deck.user_id !== user_id) {
      throw new ForbiddenException('Access denied: This deck is private');
    }

    return deck;
  }

  async execute(
    params: lessons_dtos['get_lessons']['input'],
  ): Promise<lessons_dtos['get_lessons']['output']> {
    await this.ensure_user_can_access_deck(params.user_id, params.deck_id);

    const lessons = await this.lessons_repository.find_all({
      where: { deck_id: params.deck_id },
      order: ['position', 'ASC'],
    });

    return { lessons };
  }
}
