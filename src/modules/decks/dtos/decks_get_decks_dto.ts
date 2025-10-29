import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const DecksGetDecksSchema = z.object({
  // no body params for this endpoint anymore
});

export class DecksGetDecksDto extends createZodDto(DecksGetDecksSchema) {}
