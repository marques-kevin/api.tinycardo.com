import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CardsGetCardsSchema = z.object({
  deck_id: z.string().describe('ID of the deck'),
});

export class CardsGetCardsDto extends createZodDto(CardsGetCardsSchema) {}
