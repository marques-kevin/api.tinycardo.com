import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const DecksDeleteDeckSchema = z.object({
  id: z.string().describe('ID of the deck to delete'),
});

export class DecksDeleteDeckDto extends createZodDto(DecksDeleteDeckSchema) {}
