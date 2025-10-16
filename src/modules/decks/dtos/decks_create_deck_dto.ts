import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const DecksCreateDeckSchema = z.object({
  name: z.string().min(1).max(255).describe('Name of the deck'),
  front_language: z
    .string()
    .min(2)
    .max(10)
    .describe('Language code for the front of the cards'),
  back_language: z
    .string()
    .min(2)
    .max(10)
    .describe('Language code for the back of the cards'),
});

export class DecksCreateDeckDto extends createZodDto(DecksCreateDeckSchema) {}
