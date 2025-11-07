import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const LessonsUpdateLessonSchema = z.object({
  id: z.string().describe('ID of the lesson to update'),
  name: z
    .string()
    .min(1)
    .max(255)
    .describe('New name for the lesson')
    .optional(),
  position: z
    .number()
    .int()
    .min(0)
    .describe('New position for the lesson')
    .optional(),
  cards: z.array(z.string()).describe('New array of card IDs').optional(),
});

export class LessonsUpdateLessonDto extends createZodDto(
  LessonsUpdateLessonSchema,
) {}
