import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const DeleteDeckSchema = z.object({
  id: z.string().describe('ID of the deck to delete'),
});

export class DeleteDeckDto extends createZodDto(DeleteDeckSchema) {}
