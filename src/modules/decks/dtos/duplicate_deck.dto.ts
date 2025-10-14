import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const DuplicateDeckSchema = z.object({
  deck_id: z.string().describe('ID of the deck to duplicate'),
});

export class DuplicateDeckDto extends createZodDto(DuplicateDeckSchema) {}
