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
import { DecksGetDecksHandler } from '@/modules/decks/handlers/decks_get_decks_handler/decks_get_decks_handler';
import { DecksSearchDecksHandler } from '@/modules/decks/handlers/decks_search_decks_handler/decks_search_decks_handler';
import { DecksCreateDeckHandler } from '@/modules/decks/handlers/decks_create_deck_handler/decks_create_deck_handler';
import { DecksUpdateDeckHandler } from '@/modules/decks/handlers/decks_update_deck_handler/decks_update_deck_handler';
import { DecksDeleteDeckHandler } from '@/modules/decks/handlers/decks_delete_deck_handler/decks_delete_deck_handler';
import { DecksDuplicateDeckHandler } from '@/modules/decks/handlers/decks_duplicate_deck_handler/decks_duplicate_deck_handler';
import { DecksUpsertCardsHandler } from '@/modules/decks/handlers/decks_upsert_cards_handler/decks_upsert_cards_handler';
import { DecksGetDecksDto } from '@/modules/decks/dtos/decks_get_decks_dto';
import { DecksCreateDeckDto } from '@/modules/decks/dtos/decks_create_deck_dto';
import { DecksUpdateDeckDto } from '@/modules/decks/dtos/decks_update_deck_dto';
import { DecksDeleteDeckDto } from '@/modules/decks/dtos/decks_delete_deck_dto';
import { DecksDuplicateDeckDto } from '@/modules/decks/dtos/decks_duplicate_deck_dto';
import { DecksSearchDecksDto } from '@/modules/decks/dtos/decks_search_decks_dto';
import { DecksUpsertCardsDto } from '@/modules/decks/dtos/decks_upsert_cards_dto';
import { DecksEntity } from '@/modules/decks/entities/decks_entity';

@ApiTags('Decks')
@Controller('/decks')
export class DecksController {
  constructor(
    private readonly get_decks_handler: DecksGetDecksHandler,
    private readonly search_decks_handler: DecksSearchDecksHandler,
    private readonly create_deck_handler: DecksCreateDeckHandler,
    private readonly update_deck_handler: DecksUpdateDeckHandler,
    private readonly delete_deck_handler: DecksDeleteDeckHandler,
    private readonly duplicate_deck_handler: DecksDuplicateDeckHandler,
    private readonly upsert_cards_handler: DecksUpsertCardsHandler,
  ) {}

  @ApiOperation({ summary: 'Get user decks' })
  @ApiOkResponse({ type: [DecksEntity] })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Post('/get_decks')
  async get_decks(@User() user: UsersEntity, @Body() body: DecksGetDecksDto) {
    return this.get_decks_handler.execute({
      user_id: user.id,
      take: body.take,
      skip: body.skip,
    });
  }

  @ApiOperation({ summary: 'Search public decks' })
  @Post('/search_decks')
  async search_decks(@Body() body: DecksSearchDecksDto) {
    return this.search_decks_handler.execute(body);
  }

  @ApiOperation({ summary: 'Create a new deck' })
  @ApiOkResponse({ type: DecksEntity })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Post('/create_deck')
  async create_deck(
    @User() user: UsersEntity,
    @Body() body: DecksCreateDeckDto,
  ) {
    return this.create_deck_handler.execute({
      user_id: user.id,
      ...body,
    });
  }

  @ApiOperation({ summary: 'Update a deck' })
  @ApiOkResponse({ type: DecksEntity })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Post('/update_deck')
  async update_deck(
    @User() user: UsersEntity,
    @Body() body: DecksUpdateDeckDto,
  ) {
    return this.update_deck_handler.execute({
      user_id: user.id,
      ...body,
    });
  }

  @ApiOperation({ summary: 'Delete a deck (soft delete)' })
  @ApiOkResponse({ type: DecksEntity })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Post('/delete_deck')
  async delete_deck(
    @User() user: UsersEntity,
    @Body() body: DecksDeleteDeckDto,
  ) {
    return this.delete_deck_handler.execute({
      user_id: user.id,
      id: body.id,
    });
  }

  @ApiOperation({ summary: 'Duplicate a deck' })
  @ApiOkResponse({ type: DecksEntity })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Post('/duplicate_deck')
  async duplicate_deck(
    @User() user: UsersEntity,
    @Body() body: DecksDuplicateDeckDto,
  ) {
    return this.duplicate_deck_handler.execute({
      user_id: user.id,
      deck_id: body.deck_id,
    });
  }

  @ApiOperation({ summary: 'Upsert cards in a deck' })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Post('/upsert_cards')
  async upsert_cards(
    @User() user: UsersEntity,
    @Body() body: DecksUpsertCardsDto,
  ) {
    return this.upsert_cards_handler.execute({
      user_id: user.id,
      ...body,
    });
  }
}
