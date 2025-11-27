import { Injectable } from '@nestjs/common';
import { DecksRepository } from '@/modules/decks/repositories/decks_repository';
import { Cron } from '@nestjs/schedule';
import { CronExpression } from '@nestjs/schedule';
import { LoggerService } from '@/modules/global/services/logger_service/logger_service';

@Injectable()
export class DecksRefreshDecksStatsCronHandler implements Handler<void, void> {
  constructor(
    private readonly decks_repository: DecksRepository,
    private readonly logger: LoggerService,
  ) {}

  @Cron(CronExpression.EVERY_10_MINUTES)
  public async execute(): Promise<void> {
    this.logger.info('Refreshing decks stats');
    await this.decks_repository.refresh_decks_stats();
  }
}
