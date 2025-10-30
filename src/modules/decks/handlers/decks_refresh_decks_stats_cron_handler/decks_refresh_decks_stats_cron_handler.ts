import { Injectable } from '@nestjs/common';
import { DecksRepository } from '@/modules/decks/repositories/decks_repository';
import { Cron } from '@nestjs/schedule';
import { CronExpression } from '@nestjs/schedule';

@Injectable()
export class DecksRefreshDecksStatsCronHandler implements Handler<void, void> {
  constructor(private readonly decks_repository: DecksRepository) {}

  @Cron(CronExpression.EVERY_10_MINUTES)
  public async execute(): Promise<void> {
    console.log('Refreshing decks stats');
    await this.decks_repository.refresh_decks_stats();
  }
}
