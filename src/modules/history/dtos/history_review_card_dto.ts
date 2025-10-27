import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const HistoryReviewCardSchema = z.object({
  card_id: z.string().describe('ID of the card to review'),
  status: z
    .enum(['known', 'unknown'])
    .describe('Whether the user knows or does not know the card'),
});

export class HistoryReviewCardDto extends createZodDto(
  HistoryReviewCardSchema,
) {}
