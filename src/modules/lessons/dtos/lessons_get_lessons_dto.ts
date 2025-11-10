import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';
import { LessonEntity } from '@/modules/lessons/entities/lesson_entity';

export const LessonsGetLessonsSchema = z.object({
  deck_id: z.string().describe('ID of the deck to retrieve lessons from'),
});

export class LessonsGetLessonsDto extends createZodDto(
  LessonsGetLessonsSchema,
) {}

export class LessonsGetLessonsOutputDto {
  @ApiProperty({ type: [LessonEntity] })
  lessons: LessonEntity[];
}
