import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const LessonsUpsertLessonsSchema = z.object({
  deck_id: z.string().describe('ID of the deck the lessons belong to'),
  lessons: z
    .array(
      z.object({
        id: z.string().describe('ID of the existing lesson (for update)'),
        name: z.string().min(1).max(255).describe('Name of the lesson'),
        position: z
          .number()
          .int()
          .min(0)
          .describe('Position of the lesson in the deck'),
        cards: z
          .array(z.string())
          .describe('Array of card IDs associated with the lesson'),
      }),
    )
    .min(1)
    .describe('Array of lessons to upsert'),
});

export class LessonsUpsertLessonsDto extends createZodDto(
  LessonsUpsertLessonsSchema,
) {}
