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
import { CardsCreateCardHandler } from '@/modules/cards/handlers/cards_create_card_handler/cards_create_card_handler';
import { CardsUpdateCardHandler } from '@/modules/cards/handlers/cards_update_card_handler/cards_update_card_handler';
import { CardsDeleteCardHandler } from '@/modules/cards/handlers/cards_delete_card_handler/cards_delete_card_handler';
import { CardsGetCardsDto } from '@/modules/cards/dtos/cards_get_cards_dto';
import { CardsCreateCardDto } from '@/modules/cards/dtos/cards_create_card_dto';
import { CardsUpdateCardDto } from '@/modules/cards/dtos/cards_update_card_dto';
import { CardsDeleteCardDto } from '@/modules/cards/dtos/cards_delete_card_dto';
import { CardsEntity } from '@/modules/cards/entities/cards_entity';

@ApiTags('Cards')
@Controller('/cards')
export class CardsController {
  constructor(
    private readonly get_cards_handler: CardsGetCardsHandler,
    private readonly create_card_handler: CardsCreateCardHandler,
    private readonly update_card_handler: CardsUpdateCardHandler,
    private readonly delete_card_handler: CardsDeleteCardHandler,
  ) {}

  @ApiOperation({ summary: 'Get all cards for a deck' })
  @ApiOkResponse({ type: [CardsEntity] })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Post('/get_cards')
  async get_cards(@User() user: UsersEntity, @Body() body: CardsGetCardsDto) {
    return this.get_cards_handler.execute({
      user_id: user.id,
      deck_id: body.deck_id,
    });
  }

  @ApiOperation({ summary: 'Create a new card' })
  @ApiOkResponse({ type: CardsEntity })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Post('/create_card')
  async create_card(
    @User() user: UsersEntity,
    @Body() body: CardsCreateCardDto,
  ) {
    return this.create_card_handler.execute({
      user_id: user.id,
      deck_id: body.deck_id,
      front: body.front,
      back: body.back,
    });
  }

  @ApiOperation({ summary: 'Update a card' })
  @ApiOkResponse({ type: CardsEntity })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Post('/update_card')
  async update_card(
    @User() user: UsersEntity,
    @Body() body: CardsUpdateCardDto,
  ) {
    return this.update_card_handler.execute({
      user_id: user.id,
      card_id: body.card_id,
      front: body.front,
      back: body.back,
    });
  }

  @ApiOperation({ summary: 'Delete a card' })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Post('/delete_card')
  async delete_card(
    @User() user: UsersEntity,
    @Body() body: CardsDeleteCardDto,
  ) {
    await this.delete_card_handler.execute({
      user_id: user.id,
      card_id: body.card_id,
    });
  }
}
