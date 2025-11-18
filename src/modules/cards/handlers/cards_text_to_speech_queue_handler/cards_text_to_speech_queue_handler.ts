import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Job } from 'bullmq';
import { CardsTextToSpeechHandler } from '@/modules/cards/handlers/cards_text_to_speech_handler/cards_text_to_speech_handler';
import { CardsTextToSpeechDtoInput } from '@/modules/cards/dtos/cards_text_to_speech_dto';
import { GLOBAL_QUEUES_CONSTANTS } from '@/modules/global/constants/global_queues_contants';

@Processor(GLOBAL_QUEUES_CONSTANTS['text_to_speech'], {
  concurrency: 1,
})
@Injectable()
export class CardsTextToSpeechQueueHandler extends WorkerHost {
  constructor(
    private readonly cards_text_to_speech_handler: CardsTextToSpeechHandler,
  ) {
    super();
  }

  async process(job: Job<CardsTextToSpeechDtoInput>) {
    const { card_id } = job.data;

    return this.cards_text_to_speech_handler.execute({
      card_id,
    });
  }
}
