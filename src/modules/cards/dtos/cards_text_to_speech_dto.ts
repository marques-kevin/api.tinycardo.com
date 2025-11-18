import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';

export const CardsTextToSpeechSchema = z.object({
  card_id: z.string().describe('ID of the card to convert to speech'),
});

export class CardsTextToSpeechDtoInput extends createZodDto(
  CardsTextToSpeechSchema,
) {}

export class CardsTextToSpeechDtoOutput {
  @ApiProperty({ description: 'URL of the uploaded front audio file' })
  front_url: string;

  @ApiProperty({ description: 'URL of the uploaded back audio file' })
  back_url: string;
}
