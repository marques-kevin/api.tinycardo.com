import { Injectable, BadRequestException } from '@nestjs/common';
import { LessonsRepository } from '@/modules/lessons/repositories/lessons_repository';
import {
  LessonsReorderLessonsDto,
  LessonsReorderLessonsOutputDto,
} from '@/modules/lessons/dtos/lessons_reorder_lessons_dto';
import { DecksCheckAccessHandler } from '@/modules/decks/handlers/decks_check_access_handler/decks_check_access_handler';

type lessons_dtos = {
  reorder_lessons: {
    input: LessonsReorderLessonsDto & { user_id: string };
    output: LessonsReorderLessonsOutputDto;
  };
};

@Injectable()
export class LessonsReorderLessonsHandler
  implements
    Handler<
      lessons_dtos['reorder_lessons']['input'],
      lessons_dtos['reorder_lessons']['output']
    >
{
  constructor(
    private readonly lessons_repository: LessonsRepository,
    private readonly decks_check_access_handler: DecksCheckAccessHandler,
  ) {}

  async execute(
    params: lessons_dtos['reorder_lessons']['input'],
  ): Promise<lessons_dtos['reorder_lessons']['output']> {
    await this.decks_check_access_handler.execute({
      deck_id: params.deck_id,
      user_id: params.user_id,
      level: 'owner',
    });

    // Get all lessons for this deck
    const all_lessons = await this.lessons_repository.find_all({
      where: { deck_id: params.deck_id },
    });

    // Validate that all lesson_ids in reorder_data belong to this deck
    const reorder_lesson_ids = params.reorder_data.map(
      (item) => item.lesson_id,
    );
    const missing_lessons = reorder_lesson_ids.filter(
      (lesson_id) => !all_lessons.find((lesson) => lesson.id === lesson_id),
    );

    if (missing_lessons.length > 0) {
      throw new BadRequestException(
        `Lessons not found in deck: ${missing_lessons.join(', ')}`,
      );
    }

    // Validate that all lessons in the deck are included in reorder_data
    const all_lesson_ids = all_lessons.map((lesson) => lesson.id);
    const missing_in_reorder = all_lesson_ids.filter(
      (lesson_id) => !reorder_lesson_ids.includes(lesson_id),
    );

    if (missing_in_reorder.length > 0) {
      throw new BadRequestException(
        `All lessons must be included in reorder_data. Missing: ${missing_in_reorder.join(', ')}`,
      );
    }

    // Validate that positions are unique
    const positions = params.reorder_data.map((item) => item.position);
    const unique_positions = new Set(positions);
    if (positions.length !== unique_positions.size) {
      throw new BadRequestException('Positions must be unique');
    }

    // Update all lessons with their new positions
    for (const reorder_item of params.reorder_data) {
      const lesson = all_lessons.find((l) => l.id === reorder_item.lesson_id)!;

      await this.lessons_repository.save({
        ...lesson,
        position: reorder_item.position,
        updated_at: new Date(),
      });
    }

    const reordered_lessons = await this.lessons_repository.find_all({
      where: { deck_id: params.deck_id },
      order: ['position', 'ASC'],
    });

    return {
      lessons: reordered_lessons,
    };
  }
}
