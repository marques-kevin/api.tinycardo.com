import { Injectable } from '@nestjs/common';
import {
  QueueService,
  JobOptions,
  JobData,
  BulkJob,
} from '@/modules/global/services/queue_service/queue_service';

@Injectable()
export class QueueServiceInMemory extends QueueService {
  private readonly jobs: Array<{
    name: string;
    data: JobData;
    opts?: JobOptions;
  }> = [];

  async add(params: {
    name: string;
    data: JobData;
    opts?: JobOptions;
  }): Promise<void> {
    this.jobs.push({ ...params });
  }

  async addBulk(jobs: BulkJob[]): Promise<void> {
    this.jobs.push(...jobs);
  }

  // Helper method for testing - get all queued jobs
  get_jobs(): Array<{ name: string; data: JobData; opts?: JobOptions }> {
    return [...this.jobs];
  }

  // Helper method for testing - clear all jobs
  clear(): void {
    this.jobs.length = 0;
  }
}
