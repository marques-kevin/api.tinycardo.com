import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const UpdateCardSchema = z.object({
  card_id: z.string().describe('ID of the card to update'),
  front: z.string().min(1).max(1000).describe('New front content').optional(),
  back: z.string().min(1).max(1000).describe('New back content').optional(),
});

export class UpdateCardDto extends createZodDto(UpdateCardSchema) {}
