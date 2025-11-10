import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const LessonsCreateLessonSchema = z.object({
  name: z.string().min(1).max(255).describe('Name of the lesson'),
  deck_id: z.string().describe('ID of the deck this lesson belongs to'),
  position: z
    .number()
    .int()
    .min(0)
    .describe('Position of the lesson for ordering'),
  cards: z
    .array(z.string())
    .default([])
    .describe('Array of card IDs in the lesson'),
});

export class LessonsCreateLessonDto extends createZodDto(
  LessonsCreateLessonSchema,
) {}
