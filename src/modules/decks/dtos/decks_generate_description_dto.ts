import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';

const CardSchema = z.object({
  front: z.string().describe('Front content of the card'),
  back: z.string().describe('Back content of the card'),
});

export const DecksGenerateDescriptionSchema = z.object({
  deck_id: z.string().describe('ID of the deck to generate description for'),
  name: z.string().describe('Name of the deck'),
  cards: z
    .array(CardSchema)
    .describe('Array of cards in the deck (at least front and back)'),
  front_language: z.string().describe('Language of the front side of cards'),
  back_language: z.string().describe('Language of the back side of cards'),
});

export class DecksGenerateDescriptionDto extends createZodDto(
  DecksGenerateDescriptionSchema,
) {}

export class DecksGenerateDescriptionOutputDto {
  @ApiProperty({ description: 'Generated description for the deck' })
  description: string;
}
