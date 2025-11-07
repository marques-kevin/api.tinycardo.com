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
import { LessonsUpdateLessonHandler } from '@/modules/lessons/handlers/lessons_update_lesson_handler/lessons_update_lesson_handler';
import { LessonsDeleteLessonHandler } from '@/modules/lessons/handlers/lessons_delete_lesson_handler/lessons_delete_lesson_handler';
import { LessonsGetLessonHandler } from '@/modules/lessons/handlers/lessons_get_lesson_handler/lessons_get_lesson_handler';
import { LessonsCreateLessonDto } from '@/modules/lessons/dtos/lessons_create_lesson_dto';
import { LessonsUpdateLessonDto } from '@/modules/lessons/dtos/lessons_update_lesson_dto';
import {
  LessonsGetLessonDto,
  LessonsGetLessonOutputDto,
} from '@/modules/lessons/dtos/lessons_get_lesson_dto';
import { LessonEntity } from '@/modules/lessons/entities/lesson_entity';

@ApiTags('Lessons')
@Controller('/lessons')
export class LessonsController {
  constructor(
    private readonly create_lesson_handler: LessonsCreateLessonHandler,
    private readonly update_lesson_handler: LessonsUpdateLessonHandler,
    private readonly delete_lesson_handler: LessonsDeleteLessonHandler,
    private readonly get_lesson_handler: LessonsGetLessonHandler,
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

  @ApiOperation({ summary: 'Update a lesson' })
  @ApiOkResponse({ type: LessonEntity })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Post('/update_lesson')
  async update_lesson(
    @User() user: UsersEntity,
    @Body() body: LessonsUpdateLessonDto,
  ) {
    return this.update_lesson_handler.execute({
      user_id: user.id,
      ...body,
    });
  }

  @ApiOperation({ summary: 'Delete a lesson' })
  @ApiOkResponse()
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Post('/delete_lesson')
  async delete_lesson(@User() user: UsersEntity, @Body() body: { id: string }) {
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
}
