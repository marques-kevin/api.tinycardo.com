import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { CardsEntity } from '@/modules/cards/entities/cards_entity';
import { ApiProperty } from '@nestjs/swagger';

export const CardsGetCardsSchema = z.object({
  deck_id: z.string().describe('ID of the deck'),
});

export class CardsGetCardsDtoInput extends createZodDto(CardsGetCardsSchema) {}
export class CardsGetCardsDtoOutput {
  @ApiProperty({ type: [CardsEntity] })
  cards: CardsEntity[];
}
