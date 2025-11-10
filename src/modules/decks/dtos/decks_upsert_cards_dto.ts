import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const DecksUpsertCardsSchema = z.object({
  deck_id: z.string().describe('ID of the deck'),
  cards: z
    .array(
      z.object({
        id: z.string().describe('ID of existing card (for update)'),
        front: z
          .string()
          .min(1)
          .max(1000)
          .describe('Front content of the card'),
        back: z.string().min(1).max(1000).describe('Back content of the card'),
      }),
    )
    .min(1)
    .describe('Array of cards to upsert'),
});

export class DecksUpsertCardsDto extends createZodDto(DecksUpsertCardsSchema) {}
