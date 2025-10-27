import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiOkResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@/modules/authentication/guards/jwt.guard';
import { User } from '@/modules/authentication/decorators/user_decorator';
import { UsersEntity } from '@/modules/authentication/entities/users_entity';
import { HistoryReviewCardHandler } from '@/modules/history/handlers/history_review_card_handler/history_review_card_handler';
import { HistoryGetDeckHistoryHandler } from '@/modules/history/handlers/history_get_deck_history_handler/history_get_deck_history_handler';
import { HistoryReviewCardDto } from '@/modules/history/dtos/history_review_card_dto';
import { HistoryGetDeckHistoryDto } from '@/modules/history/dtos/history_get_deck_history_dto';
import { HistoryEntity } from '@/modules/history/entities/history_entity';

@ApiTags('History')
@Controller('/history')
export class HistoryController {
  constructor(
    private readonly review_card_handler: HistoryReviewCardHandler,
    private readonly get_deck_history_handler: HistoryGetDeckHistoryHandler,
  ) {}

  @ApiOperation({ summary: 'Review cards (mark as known or unknown)' })
  @ApiOkResponse({ type: [HistoryEntity] })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Post('/review')
  async review_card(
    @User() user: UsersEntity,
    @Body() body: HistoryReviewCardDto,
  ) {
    return this.review_card_handler.execute({
      user_id: user.id,
      cards: body.cards,
    });
  }

  @ApiOperation({ summary: 'Get review history for a deck' })
  @ApiOkResponse({ type: [HistoryEntity] })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Post('/get_deck_history')
  async get_deck_history(
    @User() user: UsersEntity,
    @Body() body: HistoryGetDeckHistoryDto,
  ) {
    return this.get_deck_history_handler.execute({
      user_id: user.id,
      deck_id: body.deck_id,
    });
  }
}
