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
import { CardsTextToSpeechHandler } from '@/modules/cards/handlers/cards_text_to_speech_handler/cards_text_to_speech_handler';
import {
  CardsTextToSpeechDtoInput,
  CardsTextToSpeechDtoOutput,
} from '@/modules/cards/dtos/cards_text_to_speech_dto';
import { CardsGetSignedUrlsHandler } from '@/modules/cards/handlers/cards_get_signed_urls_handler/cards_get_signed_urls_handler';
import {
  CardsGetSignedUrlsDtoInput,
  CardsGetSignedUrlsDtoOutput,
} from '@/modules/cards/dtos/cards_get_signed_urls_dto';

@ApiTags('Cards')
@Controller('/cards')
export class CardsController {
  constructor(
    private readonly get_cards_handler: CardsGetCardsHandler,
    private readonly text_to_speech_handler: CardsTextToSpeechHandler,
    private readonly get_signed_urls_handler: CardsGetSignedUrlsHandler,
  ) {}

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

  @ApiOperation({ summary: 'Test: Generate TTS for a card' })
  @ApiOkResponse({ type: CardsTextToSpeechDtoOutput })
  @Post('/test_text_to_speech')
  async test_text_to_speech(@Body() body: CardsTextToSpeechDtoInput) {
    return this.text_to_speech_handler.execute({
      card_id: body.card_id,
    });
  }

  @ApiOperation({
    summary: 'Get all cards with signed URLs for TTS audio files',
  })
  @ApiOkResponse({ type: CardsGetSignedUrlsDtoOutput })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Post('/get_signed_urls')
  async get_signed_urls(
    @User() user: UsersEntity,
    @Body() body: CardsGetSignedUrlsDtoInput,
  ) {
    return this.get_signed_urls_handler.execute({
      user_id: user.id,
      deck_id: body.deck_id,
    });
  }
}
