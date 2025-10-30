import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { DecksEntityWithStats } from '@/modules/decks/entities/decks_entity';
import { ApiProperty } from '@nestjs/swagger';

export const DecksGetDeckByIdSchema = z.object({
  id: z.string().describe('ID of the deck to retrieve'),
});

export class DecksGetDeckByIdDto extends createZodDto(DecksGetDeckByIdSchema) {}

export class DecksGetDeckByIdOutputDto {
  @ApiProperty({ type: DecksEntityWithStats })
  deck: DecksEntityWithStats;
}
