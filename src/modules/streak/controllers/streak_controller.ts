import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiOkResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@/modules/authentication/guards/jwt.guard';
import { User } from '@/modules/authentication/decorators/user_decorator';
import { UsersEntity } from '@/modules/authentication/entities/users_entity';
import { StreakGetUserStreaksHandler } from '@/modules/streak/handlers/streak_get_user_streaks_handler/streak_get_user_streaks_handler';
import { StreakAddStreakHandler } from '@/modules/streak/handlers/streak_add_streak_handler/streak_add_streak_handler';
import { StreakAddStreakDto } from '@/modules/streak/dtos/streak_add_streak_dto';
import { StreakEntity } from '@/modules/streak/entities/streak_entity';

@ApiTags('Streaks')
@Controller('/streaks')
@UseGuards(JwtAuthGuard)
export class StreakController {
  constructor(
    private readonly get_user_streaks_handler: StreakGetUserStreaksHandler,
    private readonly add_streak_handler: StreakAddStreakHandler,
  ) {}

  @ApiOperation({ summary: 'Get user streaks' })
  @ApiOkResponse({ type: [StreakEntity] })
  @ApiBearerAuth('JWT-auth')
  @Post('/get_user_streaks')
  async get_user_streaks(@User() user: UsersEntity) {
    return this.get_user_streaks_handler.execute({
      user_id: user.id,
    });
  }

  @ApiOperation({ summary: 'Add a streak for the current day' })
  @ApiOkResponse({ type: StreakEntity })
  @ApiBearerAuth('JWT-auth')
  @Post('/add_streak')
  async add_streak(
    @User() user: UsersEntity,
    @Body() body: StreakAddStreakDto,
  ) {
    return this.add_streak_handler.execute({
      user_id: user.id,
      ...body,
    });
  }
}
