import { Injectable } from '@nestjs/common';
import { StreakRepository } from '@/modules/streak/repositories/streak_repository';
import { StreakEntity } from '@/modules/streak/entities/streak_entity';
import { v4 } from 'uuid';
import { StreakAddStreakDto } from '@/modules/streak/dtos/streak_add_streak_dto';

@Injectable()
export class StreakAddStreakHandler
  implements
    Handler<{ user_id: string } & StreakAddStreakDto, StreakEntity | null>
{
  constructor(private readonly streak_repository: StreakRepository) {}

  /**
   * Get the date string for the current day in the user's timezone or UTC by default
   *
   * @param params - The parameters object
   * @returns The date string
   */
  private get_date_string(params: { timezone?: string }) {
    if (params.timezone) {
      return new Date().toLocaleDateString('en-CA', {
        timeZone: params.timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
    }

    return new Date().toISOString().split('T')[0]; // Get YYYY-MM-DD
  }

  async execute(params: { user_id: string } & StreakAddStreakDto) {
    const date_string = this.get_date_string({ timezone: params.timezone });

    const existing_streaks = await this.streak_repository.find_all({
      where: { user_id: params.user_id, date: date_string },
    });

    if (existing_streaks.length > 0) {
      return existing_streaks[0];
    }

    const new_streak: StreakEntity = {
      id: v4(),
      user_id: params.user_id,
      date: date_string,
    };

    return this.streak_repository.save(new_streak);
  }
}
