import { UptimeService } from '@/modules/global/services/uptime_service/uptime_service';

export class UptimeServiceInMemory extends UptimeService {
  private history: Record<string, Array<Date>> = {};

  async ping(params: Parameters<UptimeService['ping']>[0]): Promise<void> {
    this.history[params.service_name] = [
      ...(this.history[params.service_name] || []),
      new Date(),
    ];
  }
}
