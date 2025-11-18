import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { CARDS_TEXT_TO_SPEECH_QUEUE } from '@/modules/cards/handlers/cards_text_to_speech_cron_handler/cards_text_to_speech_cron_handler';

@Injectable()
export class CardsTextToSpeechQueueService {
  private readonly job_options = {
    timeout: 5 * 60 * 1000, // 5 minutes
    // Keep last 100 completed jobs for debugging/monitoring
    removeOnComplete: {
      count: 100,
      age: 7 * 24 * 60 * 60 * 1000, // Remove completed jobs older than 7 days
    },
    removeOnFail: {
      count: 50,
      age: 3 * 24 * 60 * 60 * 1000, // Remove failed jobs older than 3 days
    },
    attempts: 3,
    backoff: {
      type: 'exponential' as const,
      delay: 2000, // Start with 2 seconds, then 4s, 8s, etc.
    },
  };

  constructor(
    @InjectQueue(CARDS_TEXT_TO_SPEECH_QUEUE)
    private readonly queue: Queue,
  ) {}

  async enqueue_card(card_id: string): Promise<void> {
    await this.queue.add('tts', { card_id }, this.job_options);
  }

  async enqueue_cards(card_ids: string[]): Promise<void> {
    const jobs = card_ids.map((card_id) => ({
      name: 'tts',
      data: { card_id },
      opts: this.job_options,
    }));

    await this.queue.addBulk(jobs);
  }
}
