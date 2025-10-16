import { CardsEntity } from '@/modules/cards/entities/cards_entity';
import { CardsController } from '@/modules/cards/controllers/cards_controller';
import { CardsRepository } from '@/modules/cards/repositories/cards_repository';
import { CardsRepositoryPostgres } from '@/modules/cards/repositories/cards_repository_postgres';
import { CardsRepositoryInMemory } from '@/modules/cards/repositories/cards_repository_in_memory';
import { CardsGetCardsHandler } from '@/modules/cards/handlers/cards_get_cards_handler/cards_get_cards_handler';
import { CardsCreateCardHandler } from '@/modules/cards/handlers/cards_create_card_handler/cards_create_card_handler';
import { CardsUpdateCardHandler } from '@/modules/cards/handlers/cards_update_card_handler/cards_update_card_handler';
import { CardsDeleteCardHandler } from '@/modules/cards/handlers/cards_delete_card_handler/cards_delete_card_handler';

export const cards_module = {
  entities: [CardsEntity],
  controllers: [CardsController],
  handlers: [
    CardsGetCardsHandler,
    CardsCreateCardHandler,
    CardsUpdateCardHandler,
    CardsDeleteCardHandler,
  ],
  repositories: [
    {
      provide: CardsRepository,
      useClass: CardsRepositoryPostgres,
    },
  ],
};

export const cards_module_for_tests = {
  ...cards_module,
  repositories: [
    {
      provide: CardsRepository,
      useClass: CardsRepositoryInMemory,
    },
  ],
};
