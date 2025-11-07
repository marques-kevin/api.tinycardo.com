import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';
import { LessonEntity } from '@/modules/lessons/entities/lesson_entity';

export const LessonsReorderLessonsSchema = z.object({
  deck_id: z.string().describe('ID of the deck containing the lessons'),
  reorder_data: z
    .array(
      z.object({
        lesson_id: z.string().describe('ID of the lesson'),
        position: z
          .number()
          .int()
          .min(0)
          .describe('New position for the lesson'),
      }),
    )
    .describe('Array of lesson IDs with their new positions'),
});

export class LessonsReorderLessonsDto extends createZodDto(
  LessonsReorderLessonsSchema,
) {}

export class LessonsReorderLessonsOutputDto {
  @ApiProperty({ type: [LessonEntity] })
  lessons: LessonEntity[];
}
