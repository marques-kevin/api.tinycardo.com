import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreateCardSchema = z.object({
  deck_id: z.string().describe('ID of the deck'),
  front: z.string().min(1).max(1000).describe('Front content of the card'),
  back: z.string().min(1).max(1000).describe('Back content of the card'),
});

export class CreateCardDto extends createZodDto(CreateCardSchema) {}
