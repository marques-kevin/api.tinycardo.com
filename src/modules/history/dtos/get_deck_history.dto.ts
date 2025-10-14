import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const GetDeckHistorySchema = z.object({
  deck_id: z.string().describe('ID of the deck'),
});

export class GetDeckHistoryDto extends createZodDto(GetDeckHistorySchema) {}
