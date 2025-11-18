import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import {
  QueueService,
  JobOptions,
  JobData,
  BulkJob,
} from '@/modules/global/services/queue_service/queue_service';
import { InjectQueue } from '@nestjs/bullmq';
import { GLOBAL_QUEUES_CONSTANTS } from '@/modules/global/constants/global_queues_contants';

@Injectable()
export class QueueServiceBullMQ extends QueueService {
  constructor(
    @InjectQueue(GLOBAL_QUEUES_CONSTANTS['text_to_speech'])
    private readonly queue: Queue,
  ) {
    super();
  }

  async add(params: {
    name: string;
    data: JobData;
    opts?: JobOptions;
  }): Promise<void> {
    await this.queue.add(params.name, params.data, params.opts);
  }

  async addBulk(jobs: BulkJob[]): Promise<void> {
    await this.queue.addBulk(jobs);
  }
}
