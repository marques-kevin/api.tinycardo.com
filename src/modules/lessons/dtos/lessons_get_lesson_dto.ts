import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { LessonEntity } from '@/modules/lessons/entities/lesson_entity';
import { ApiProperty } from '@nestjs/swagger';

export const LessonsGetLessonSchema = z.object({
  id: z.string().describe('ID of the lesson to retrieve'),
});

export class LessonsGetLessonDto extends createZodDto(LessonsGetLessonSchema) {}

export class LessonsGetLessonOutputDto {
  @ApiProperty({ type: LessonEntity })
  lesson: LessonEntity;
}
