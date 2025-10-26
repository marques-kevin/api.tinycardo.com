import { CardsEntity } from '@/modules/cards/entities/cards_entity';
import { CardsController } from '@/modules/cards/controllers/cards_controller';
import { CardsRepository } from '@/modules/cards/repositories/cards_repository';
import { CardsRepositoryPostgres } from '@/modules/cards/repositories/cards_repository_postgres';
import { CardsRepositoryInMemory } from '@/modules/cards/repositories/cards_repository_in_memory';
import { CardsGetCardsHandler } from '@/modules/cards/handlers/cards_get_cards_handler/cards_get_cards_handler';

export const cards_module = {
  entities: [CardsEntity],
  controllers: [CardsController],
  handlers: [CardsGetCardsHandler],
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
