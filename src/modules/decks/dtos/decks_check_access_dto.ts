import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';
import { DecksEntity } from '@/modules/decks/entities/decks_entity';

export const DecksCheckAccessSchema = z.object({
  deck_id: z.string().describe('ID of the deck to check access for'),
  user_id: z.string().describe('ID of the user requesting access'),
  level: z
    .enum(['owner', 'all'])
    .default('all')
    .describe(
      'Access level: "owner" requires ownership, "all" uses smart strategy (allows users with history)',
    ),
});

export class DecksCheckAccessDtoInput extends createZodDto(
  DecksCheckAccessSchema,
) {}

export class DecksCheckAccessDtoOutput {
  @ApiProperty({ type: DecksEntity })
  deck: DecksEntity;
}
