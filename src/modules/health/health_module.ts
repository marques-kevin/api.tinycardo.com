import { HealthController } from '@/modules/health/controllers/health_controller';

export const health_module = {
  entities: [],
  controllers: [HealthController],
  handlers: [],
  repositories: [],
  services: [],
};

export const health_module_for_tests = {
  ...health_module,
};
