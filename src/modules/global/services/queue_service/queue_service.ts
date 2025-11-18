export interface JobOptions {
  removeOnComplete?: {
    count?: number;
    age?: number;
  };
  removeOnFail?: {
    count?: number;
    age?: number;
  };
  [key: string]: any;
}

export interface JobData {
  [key: string]: any;
}

export interface BulkJob {
  name: string;
  data: JobData;
  opts?: JobOptions;
}

export abstract class QueueService {
  abstract add(params: {
    name: string;
    data: JobData;
    opts?: JobOptions;
  }): Promise<void>;

  abstract addBulk(jobs: BulkJob[]): Promise<void>;
}
