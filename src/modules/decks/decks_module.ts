import { DecksEntity } from '@/modules/decks/entities/decks_entity';
import { CardsEntity } from '@/modules/cards/entities/cards_entity';
import { DecksController } from '@/modules/decks/controllers/decks_controller';
import { DecksGetDecksHandler } from '@/modules/decks/handlers/decks_get_decks_handler';
import { DecksSearchDecksHandler } from '@/modules/decks/handlers/decks_search_decks_handler';
import { DecksCreateDeckHandler } from '@/modules/decks/handlers/decks_create_deck_handler';
import { DecksUpdateDeckHandler } from '@/modules/decks/handlers/decks_update_deck_handler';
import { DecksDeleteDeckHandler } from '@/modules/decks/handlers/decks_delete_deck_handler';
import { DecksDuplicateDeckHandler } from '@/modules/decks/handlers/decks_duplicate_deck_handler';
import { DecksUpsertCardsHandler } from '@/modules/decks/handlers/decks_upsert_cards_handler';
import { DecksRepository } from '@/modules/decks/repositories/decks_repository';
import { DecksRepositoryPostgres } from '@/modules/decks/repositories/decks_repository_postgres';
import { CardsRepository } from '@/modules/cards/repositories/cards_repository';
import { CardsRepositoryPostgres } from '@/modules/cards/repositories/cards_repository_postgres';
import { DecksRepositoryInMemory } from '@/modules/decks/repositories/decks_repository_in_memory';
import { CardsRepositoryInMemory } from '@/modules/cards/repositories/cards_repository_in_memory';

export const decks_module = {
  entities: [DecksEntity, CardsEntity],
  controllers: [DecksController],
  handlers: [
    DecksGetDecksHandler,
    DecksSearchDecksHandler,
    DecksCreateDeckHandler,
    DecksUpdateDeckHandler,
    DecksDeleteDeckHandler,
    DecksDuplicateDeckHandler,
    DecksUpsertCardsHandler,
  ],
  repositories: [
    {
      provide: DecksRepository,
      useClass: DecksRepositoryPostgres,
    },
    {
      provide: CardsRepository,
      useClass: CardsRepositoryPostgres,
    },
  ],
};

export const decks_module_for_tests = {
  ...decks_module,
  repositories: [
    {
      provide: DecksRepository,
      useClass: DecksRepositoryInMemory,
    },
    {
      provide: CardsRepository,
      useClass: CardsRepositoryInMemory,
    },
  ],
};
