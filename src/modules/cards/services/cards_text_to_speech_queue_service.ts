import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { CARDS_TEXT_TO_SPEECH_QUEUE } from '@/modules/cards/handlers/cards_text_to_speech_cron_handler/cards_text_to_speech_cron_handler';

@Injectable()
export class CardsTextToSpeechQueueService {
  constructor(
    @InjectQueue(CARDS_TEXT_TO_SPEECH_QUEUE)
    private readonly queue: Queue,
  ) {}

  async enqueue_card(card_id: string): Promise<void> {
    await this.queue.add('process-card', {
      card_id,
    });
  }

  async enqueue_cards(card_ids: string[]): Promise<void> {
    const jobs = card_ids.map((card_id) => ({
      name: 'process-card',
      data: { card_id },
    }));

    await this.queue.addBulk(jobs);
  }
}
