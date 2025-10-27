import { Injectable } from '@nestjs/common';
import { StreakRepository } from '@/modules/streak/repositories/streak_repository';
import { StreakEntity } from '@/modules/streak/entities/streak_entity';

@Injectable()
export class StreakGetUserStreaksHandler
  implements Handler<{ user_id: string }, StreakEntity[]>
{
  constructor(private readonly streak_repository: StreakRepository) {}

  async execute(params: { user_id: string }) {
    return this.streak_repository.find_all({
      where: { user_id: params.user_id },
      order: ['date', 'DESC'],
    });
  }
}
