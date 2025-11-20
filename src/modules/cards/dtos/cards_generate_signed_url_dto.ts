import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';

export const CardsGenerateSignedUrlSchema = z.object({
  text: z.string().describe('Text content to generate signed URL for'),
  language: z.string().describe('Language code (e.g., "en", "en-US", "fr")'),
});

export class CardsGenerateSignedUrlDtoInput extends createZodDto(
  CardsGenerateSignedUrlSchema,
) {}

export class CardsGenerateSignedUrlDtoOutput {
  @ApiProperty({ description: 'Signed URL for the TTS audio file' })
  signed_url: string;
}

