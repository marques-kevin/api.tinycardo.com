import { ApiProperty } from '@nestjs/swagger';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CardsGetTtsFilenameSchema = z.object({
  text: z.string().describe('Text content to generate filename for'),
  language: z.string().describe('Language code (e.g., "en", "en-US", "fr")'),
});

export class CardsGetTtsFilenameDtoInput extends createZodDto(
  CardsGetTtsFilenameSchema,
) {}

export class CardsGetTtsFilenameDtoOutput {
  @ApiProperty({ description: 'Generated filename' })
  filename: string;
}
