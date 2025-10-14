import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const DeleteCardSchema = z.object({
  card_id: z.string().describe('ID of the card to delete'),
});

export class DeleteCardDto extends createZodDto(DeleteCardSchema) {}
