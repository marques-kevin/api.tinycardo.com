import {
  UptimeService,
  UptimeServiceNames,
} from '@/modules/global/services/uptime_service/uptime_service';
import { LoggerService } from '@nestjs/common';

export class UptimeServiceBetterstack extends UptimeService {
  constructor(private readonly logger: LoggerService) {
    super();
  }

  private get_token_by_name(name: keyof typeof UptimeServiceNames) {
    return process.env[`BETTER_STACK_HEARTBEAT_TOKEN_${name}`];
  }

  async ping(params: Parameters<UptimeService['ping']>[0]): Promise<void> {
    const token = this.get_token_by_name(params.service_name);

    if (!token) {
      this.logger.error(`heartbeat token not found`, {
        service_name: params.service_name,
      });

      return;
    } else {
      await fetch(`https://uptime.betterstack.com/api/v1/heartbeat/${token}`);
    }
  }
}
