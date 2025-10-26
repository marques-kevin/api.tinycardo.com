import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const DecksGetDeckByIdSchema = z.object({
  id: z.string().describe('ID of the deck to retrieve'),
});

export class DecksGetDeckByIdDto extends createZodDto(DecksGetDeckByIdSchema) {}
