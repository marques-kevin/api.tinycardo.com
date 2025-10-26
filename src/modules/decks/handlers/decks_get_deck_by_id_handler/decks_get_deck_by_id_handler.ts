import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { DecksRepository } from '@/modules/decks/repositories/decks_repository';
import { DecksEntity } from '@/modules/decks/entities/decks_entity';
import { DecksGetDeckByIdDto } from '@/modules/decks/dtos/decks_get_deck_by_id_dto';

@Injectable()
export class DecksGetDeckByIdHandler
  implements Handler<DecksGetDeckByIdDto & { user_id?: string }, DecksEntity>
{
  constructor(private readonly decks_repository: DecksRepository) {}

  async execute(params: DecksGetDeckByIdDto & { user_id?: string }) {
    const deck = await this.decks_repository.find_by_id(params.id);

    if (!deck) {
      throw new NotFoundException('Deck not found');
    }

    // Check if deck is soft-deleted
    if (deck.deleted_at) {
      throw new NotFoundException('Deck not found');
    }

    // Check visibility
    if (deck.visibility === 'private') {
      // If deck is private, check if user is the owner
      if (!params.user_id || deck.user_id !== params.user_id) {
        throw new ForbiddenException('Access denied: This deck is private');
      }
    }

    return deck;
  }
}
