import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const LessonsDeleteLessonSchema = z.object({
  id: z.string().describe('ID of the lesson to delete'),
});

export class LessonsDeleteLessonDto extends createZodDto(
  LessonsDeleteLessonSchema,
) {}
