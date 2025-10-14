import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const GetDecksSchema = z.object({
  take: z
    .number()
    .int()
    .positive()
    .max(100)
    .optional()
    .describe('Number of decks to retrieve'),
  skip: z.number().int().min(0).optional().describe('Number of decks to skip'),
});

export class GetDecksDto extends createZodDto(GetDecksSchema) {}
