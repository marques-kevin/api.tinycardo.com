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
import { CardsGetCardsHandler } from '@/modules/cards/handlers/cards_get_cards_handler/cards_get_cards_handler';
import {
  CardsGetCardsDtoInput,
  CardsGetCardsDtoOutput,
} from '@/modules/cards/dtos/cards_get_cards_dto';

@ApiTags('Cards')
@Controller('/cards')
export class CardsController {
  constructor(private readonly get_cards_handler: CardsGetCardsHandler) {}

  @ApiOperation({ summary: 'Get all cards for a deck' })
  @ApiOkResponse({ type: CardsGetCardsDtoOutput })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Post('/get_cards')
  async get_cards(
    @User() user: UsersEntity,
    @Body() body: CardsGetCardsDtoInput,
  ) {
    return this.get_cards_handler.execute({
      user_id: user.id,
      deck_id: body.deck_id,
    });
  }
}
