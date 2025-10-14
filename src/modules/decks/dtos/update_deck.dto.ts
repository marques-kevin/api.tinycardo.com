import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const UpdateDeckSchema = z.object({
  id: z.string().describe('ID of the deck to update'),
  name: z.string().min(1).max(255).describe('New name for the deck').optional(),
  front_language: z
    .string()
    .min(2)
    .max(10)
    .describe('New front language code')
    .optional(),
  back_language: z
    .string()
    .min(2)
    .max(10)
    .describe('New back language code')
    .optional(),
});

export class UpdateDeckDto extends createZodDto(UpdateDeckSchema) {}
