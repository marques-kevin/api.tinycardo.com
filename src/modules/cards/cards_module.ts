import { CardsEntity } from '@/modules/cards/entities/cards_entity';
import { CardsController } from '@/modules/cards/controllers/cards_controller';
import { CardsRepository } from '@/modules/cards/repositories/cards_repository';
import { CardsRepositoryPostgres } from '@/modules/cards/repositories/cards_repository_postgres';
import { CardsRepositoryInMemory } from '@/modules/cards/repositories/cards_repository_in_memory';
import { CardsGetCardsHandler } from '@/modules/cards/handlers/cards_get_cards_handler/cards_get_cards_handler';
import { CardsTextToSpeechHandler } from '@/modules/cards/handlers/cards_text_to_speech_handler/cards_text_to_speech_handler';
import { CardsTextToSpeechQueueHandler } from '@/modules/cards/handlers/cards_text_to_speech_queue_handler/cards_text_to_speech_queue_handler';
import { CardsGenerateSignedUrlHandler } from '@/modules/cards/handlers/cards_generate_signed_url_handler/cards_generate_signed_url_handler';
import { CardsGetTtsFilenameHandler } from '@/modules/cards/handlers/cards_get_tts_filename_handler/cards_get_tts_filename_handler';

export const cards_module = {
  entities: [CardsEntity],
  controllers: [CardsController],
  handlers: [
    CardsGetCardsHandler,
    CardsTextToSpeechHandler,
    CardsTextToSpeechQueueHandler,
    CardsGenerateSignedUrlHandler,
    CardsGetTtsFilenameHandler,
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
