import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Job } from 'bullmq';
import { CardsTextToSpeechHandler } from '@/modules/cards/handlers/cards_text_to_speech_handler/cards_text_to_speech_handler';
import { CardsTextToSpeechDtoInput } from '@/modules/cards/dtos/cards_text_to_speech_dto';

export const CARDS_TEXT_TO_SPEECH_QUEUE = 'cards_text_to_speech';

@Processor(CARDS_TEXT_TO_SPEECH_QUEUE, {
  concurrency: 1,
})
@Injectable()
export class CardsTextToSpeechCronHandler extends WorkerHost {
  constructor(
    private readonly cards_text_to_speech_handler: CardsTextToSpeechHandler,
  ) {
    super();
  }

  async process(job: Job<CardsTextToSpeechDtoInput>) {
    const { card_id } = job.data;

    console.log('Processing card:', card_id);

    return this.cards_text_to_speech_handler.execute({
      card_id,
    });
  }
}
