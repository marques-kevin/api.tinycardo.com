import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';

export const CardsGetSignedUrlsSchema = z.object({
  deck_id: z.string().describe('ID of the deck'),
});

export class CardsGetSignedUrlsDtoInput extends createZodDto(
  CardsGetSignedUrlsSchema,
) {}

export class CardWithSignedUrls {
  @ApiProperty({ description: 'ID of the card' })
  id: string;

  @ApiProperty({
    description: 'Signed URL for the front TTS audio file',
  })
  front_signed_url: string;

  @ApiProperty({
    description: 'Signed URL for the back TTS audio file',
  })
  back_signed_url: string;
}

export class CardsGetSignedUrlsDtoOutput {
  @ApiProperty({ type: [CardWithSignedUrls] })
  cards: CardWithSignedUrls[];
}
