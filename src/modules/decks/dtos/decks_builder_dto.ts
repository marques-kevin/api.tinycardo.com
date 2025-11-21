import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';

const CardSchema = z.object({
  id: z.string().describe('Unique identifier of the card'),
  front: z.string().describe('Front content of the card'),
  back: z.string().describe('Back content of the card'),
});

const LessonSchema = z.object({
  id: z.string().describe('Unique identifier of the lesson'),
  name: z.string().describe('Name of the lesson'),
  position: z.number().describe('Position of the lesson for ordering'),
  cards: z.array(z.string()).describe('Array of card IDs in the lesson'),
});

const DeckSchema = z.object({
  name: z.string().describe('Name of the deck'),
  description: z.string().describe('Description of the deck'),
  front_language: z.string().describe('Language of the front side of cards'),
  back_language: z.string().describe('Language of the back side of cards'),
});

export const DecksBuilderSchema = z.object({
  deck: DeckSchema.describe('The deck to update'),
  cards: z.array(CardSchema).describe('Array of cards in the deck'),
  lessons: z.array(LessonSchema).describe('Array of lessons in the deck'),
  prompt: z
    .string()
    .min(1)
    .describe('Prompt describing how to update the deck'),
});

export class DecksBuilderDto extends createZodDto(DecksBuilderSchema) {}

export class DecksBuilderOutputDto {
  @ApiProperty({ type: DecksBuilderDto['deck'] })
  deck: DecksBuilderDto['deck'];

  @ApiProperty({ type: DecksBuilderDto['cards'] })
  cards: DecksBuilderDto['cards'];

  @ApiProperty({ type: DecksBuilderDto['lessons'] })
  lessons: DecksBuilderDto['lessons'];
}
