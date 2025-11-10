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
import { LessonsCreateLessonHandler } from '@/modules/lessons/handlers/lessons_create_lesson_handler/lessons_create_lesson_handler';
import { LessonsUpsertLessonsHandler } from '@/modules/lessons/handlers/lessons_upsert_lessons_handler/lessons_upsert_lessons_handler';
import { LessonsDeleteLessonHandler } from '@/modules/lessons/handlers/lessons_delete_lesson_handler/lessons_delete_lesson_handler';
import { LessonsGetLessonHandler } from '@/modules/lessons/handlers/lessons_get_lesson_handler/lessons_get_lesson_handler';
import { LessonsReorderLessonsHandler } from '@/modules/lessons/handlers/lessons_reorder_lessons_handler/lessons_reorder_lessons_handler';
import { LessonsGetLessonsHandler } from '@/modules/lessons/handlers/lessons_get_lessons_handler/lessons_get_lessons_handler';
import { LessonsCreateLessonDto } from '@/modules/lessons/dtos/lessons_create_lesson_dto';
import { LessonsDeleteLessonDto } from '@/modules/lessons/dtos/lessons_delete_lesson_dto';
import {
  LessonsReorderLessonsDto,
  LessonsReorderLessonsOutputDto,
} from '@/modules/lessons/dtos/lessons_reorder_lessons_dto';
import {
  LessonsGetLessonDto,
  LessonsGetLessonOutputDto,
} from '@/modules/lessons/dtos/lessons_get_lesson_dto';
import {
  LessonsGetLessonsDto,
  LessonsGetLessonsOutputDto,
} from '@/modules/lessons/dtos/lessons_get_lessons_dto';
import { LessonsUpsertLessonsDto } from '@/modules/lessons/dtos/lessons_upsert_lessons_dto';
import { LessonsUpsertLessonsOutputDto } from '@/modules/lessons/dtos/lessons_upsert_lessons_output_dto';
import { LessonEntity } from '@/modules/lessons/entities/lesson_entity';

@ApiTags('Lessons')
@Controller('/lessons')
export class LessonsController {
  constructor(
    private readonly create_lesson_handler: LessonsCreateLessonHandler,
    private readonly upsert_lessons_handler: LessonsUpsertLessonsHandler,
    private readonly delete_lesson_handler: LessonsDeleteLessonHandler,
    private readonly get_lesson_handler: LessonsGetLessonHandler,
    private readonly reorder_lessons_handler: LessonsReorderLessonsHandler,
    private readonly get_lessons_handler: LessonsGetLessonsHandler,
  ) {}

  @ApiOperation({ summary: 'Create a new lesson' })
  @ApiOkResponse({ type: LessonEntity })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Post('/create_lesson')
  async create_lesson(
    @User() user: UsersEntity,
    @Body() body: LessonsCreateLessonDto,
  ) {
    return this.create_lesson_handler.execute({
      user_id: user.id,
      ...body,
    });
  }

  @ApiOperation({ summary: 'Upsert lessons in a deck' })
  @ApiOkResponse({ type: LessonsUpsertLessonsOutputDto })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Post('/upsert_lessons')
  async upsert_lessons(
    @User() user: UsersEntity,
    @Body() body: LessonsUpsertLessonsDto,
  ): Promise<LessonsUpsertLessonsOutputDto> {
    return this.upsert_lessons_handler.execute({
      user_id: user.id,
      ...body,
    });
  }

  @ApiOperation({ summary: 'Delete a lesson' })
  @ApiOkResponse()
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Post('/delete_lesson')
  async delete_lesson(
    @User() user: UsersEntity,
    @Body() body: LessonsDeleteLessonDto,
  ) {
    return this.delete_lesson_handler.execute({
      user_id: user.id,
      id: body.id,
    });
  }

  @ApiOperation({ summary: 'Get a lesson by ID' })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: LessonsGetLessonOutputDto })
  @Post('/get_lesson')
  async get_lesson(
    @Body() body: LessonsGetLessonDto,
    @User() user: UsersEntity,
  ) {
    return this.get_lesson_handler.execute({
      id: body.id,
      user_id: user.id,
    });
  }

  @ApiOperation({ summary: 'Get all lessons in a deck' })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: LessonsGetLessonsOutputDto })
  @Post('/get_lessons')
  async get_lessons(
    @Body() body: LessonsGetLessonsDto,
    @User() user: UsersEntity,
  ): Promise<LessonsGetLessonsOutputDto> {
    return this.get_lessons_handler.execute({
      deck_id: body.deck_id,
      user_id: user.id,
    });
  }

  @ApiOperation({ summary: 'Reorder lessons in a deck' })
  @ApiOkResponse({ type: LessonsReorderLessonsOutputDto })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Post('/reorder_lessons')
  async reorder_lessons(
    @User() user: UsersEntity,
    @Body() body: LessonsReorderLessonsDto,
  ): Promise<LessonsReorderLessonsOutputDto> {
    return this.reorder_lessons_handler.execute({
      user_id: user.id,
      ...body,
    });
  }
}
