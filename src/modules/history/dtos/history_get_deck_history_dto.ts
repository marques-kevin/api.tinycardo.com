import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const HistoryGetDeckHistorySchema = z.object({
  deck_id: z.string().describe('ID of the deck'),
});

export class HistoryGetDeckHistoryDto extends createZodDto(
  HistoryGetDeckHistorySchema,
) {}
