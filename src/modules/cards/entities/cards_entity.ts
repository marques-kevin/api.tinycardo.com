import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity({ name: 'cards' })
export class CardsEntity {
  @ApiProperty({ description: 'Unique identifier of the card' })
  @PrimaryColumn()
  id: string;

  @ApiProperty({ description: 'ID of the deck this card belongs to' })
  @Column()
  deck_id: string;

  @ApiProperty({ description: 'Front content of the card' })
  @Column()
  front: string;

  @ApiProperty({ description: 'Back content of the card' })
  @Column()
  back: string;

  @ApiProperty({ description: 'Creation timestamp' })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @UpdateDateColumn()
  updated_at: Date;
}

export class CardWithAudioUrls extends CardsEntity {
  @ApiProperty({ description: 'URL of the front audio file' })
  front_audio_url: string;

  @ApiProperty({ description: 'URL of the back audio file' })
  back_audio_url: string;
}
