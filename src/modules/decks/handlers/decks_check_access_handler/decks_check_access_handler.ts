import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { DecksRepository } from '@/modules/decks/repositories/decks_repository';
import { HistoryRepository } from '@/modules/history/repositories/history_repository';
import {
  DecksCheckAccessDtoInput,
  DecksCheckAccessDtoOutput,
} from '@/modules/decks/dtos/decks_check_access_dto';

@Injectable()
export class DecksCheckAccessHandler
  implements Handler<DecksCheckAccessDtoInput, DecksCheckAccessDtoOutput>
{
  constructor(
    private readonly decks_repository: DecksRepository,
    private readonly history_repository: HistoryRepository,
  ) {}

  async execute(
    params: DecksCheckAccessDtoInput,
  ): Promise<DecksCheckAccessDtoOutput> {
    const deck = await this.decks_repository.find_by_id(params.deck_id);

    if (!deck) {
      throw new NotFoundException('Deck not found');
    }

    // If level is 'owner', check if user is the owner
    if (params.level === 'owner') {
      if (deck.user_id !== params.user_id) {
        throw new ForbiddenException(
          'Access denied: You must be the owner of this deck',
        );
      }
      return { deck };
    }

    // Level 'all': Check visibility with smart strategy:
    // - If deck is private, check if user is the owner OR has history with the deck
    // - Users with history can access private decks even if they're not the owner
    //   (they started using it before it became private or have progress)
    if (deck.visibility === 'private') {
      const history = await this.history_repository.find_all({
        where: { deck_id: params.deck_id, user_id: params.user_id },
        take: 1,
      });

      const does_user_use_the_deck = history.length > 0;

      // If user doesn't use the deck and is not the owner, deny access
      if (!does_user_use_the_deck && deck.user_id !== params.user_id) {
        throw new ForbiddenException('Access denied: This deck is private');
      }
    }

    return { deck };
  }
}
