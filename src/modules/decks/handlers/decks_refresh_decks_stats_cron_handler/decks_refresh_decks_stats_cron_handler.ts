import { Injectable } from '@nestjs/common';
import { DecksRepository } from '@/modules/decks/repositories/decks_repository';
import { Cron } from '@nestjs/schedule';
import { CronExpression } from '@nestjs/schedule';
import {
  UptimeService,
  UptimeServiceNames,
} from '@/modules/global/services/uptime_service/uptime_service';

@Injectable()
export class DecksRefreshDecksStatsCronHandler implements Handler<void, void> {
  constructor(
    private readonly decks_repository: DecksRepository,
    private readonly uptime_service: UptimeService,
  ) {}

  @Cron(CronExpression.EVERY_10_MINUTES)
  public async execute(): Promise<void> {
    await this.decks_repository.refresh_decks_stats();
    await this.uptime_service.ping({
      service_name: UptimeServiceNames.DECKS_REFRESH_MATERIALIZED_VIEW,
    });
  }
}
