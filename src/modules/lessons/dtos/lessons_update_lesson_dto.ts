import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const LessonsUpdateLessonSchema = z.object({
  id: z.string().describe('ID of the lesson to update'),
  deck_id: z
    .string()
    .describe(
      'ID of the deck the lesson belongs to. Required when creating a new lesson.',
    ),
  name: z.string().min(1).max(255).describe('New name for the lesson'),
  position: z.number().int().min(0).describe('New position for the lesson'),
  cards: z.array(z.string()).describe('New array of card IDs'),
});

export class LessonsUpdateLessonDto extends createZodDto(
  LessonsUpdateLessonSchema,
) {}
