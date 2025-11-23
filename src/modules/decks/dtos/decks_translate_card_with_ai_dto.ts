import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';

export const DecksTranslateCardWithAiSchema = z.object({
  front: z.string().describe('Front content of the card to translate'),
  back: z.string().describe('Back content of the card (optional, for context)'),
  front_language: z.string().describe('Language of the front side'),
  back_language: z
    .string()
    .describe('Language to translate to (back language)'),
});

export class DecksTranslateCardWithAiDto extends createZodDto(
  DecksTranslateCardWithAiSchema,
) {}

export class DecksTranslateCardWithAiOutputDto {
  @ApiProperty({ description: 'Translated front text' })
  front: string;
  @ApiProperty({ description: 'Translated back text' })
  back: string;
}
