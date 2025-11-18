import { QueueService } from '@/modules/global/services/queue_service/queue_service';
import { QueueServiceBullMQ } from '@/modules/global/services/queue_service/queue_service_bullmq';
import { StorageService } from '@/modules/global/services/storage_service/storage_service';
import { StorageServiceS3 } from '@/modules/global/services/storage_service/storage_service_s3';
import { QueueServiceInMemory } from '@/modules/global/services/queue_service/queue_service_in_memory';
import { StorageServiceInMemory } from '@/modules/global/services/storage_service/storage_service_in_memory';

export const global_module = {
  services: [
    {
      provide: QueueService,
      useClass: QueueServiceBullMQ,
    },
    {
      provide: StorageService,
      useClass: StorageServiceS3,
    },
  ],
};

export const global_module_for_tests = {
  ...global_module,
  services: [
    {
      provide: QueueService,
      useClass: QueueServiceInMemory,
    },
    {
      provide: StorageService,
      useClass: StorageServiceInMemory,
    },
  ],
};
