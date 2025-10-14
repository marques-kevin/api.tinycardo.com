import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity({ name: 'history' })
export class HistoryEntity {
  @ApiProperty({ description: 'Unique identifier of the history record' })
  @PrimaryColumn()
  id: string;

  @ApiProperty({ description: 'User ID who reviewed the card' })
  @Column()
  user_id: string;

  @ApiProperty({ description: 'Deck ID the card belongs to' })
  @Column()
  deck_id: string;

  @ApiProperty({ description: 'Card ID that was reviewed' })
  @Column()
  card_id: string;

  @ApiProperty({
    description: 'Number of consecutive successful reviews',
    example: 0,
  })
  @Column()
  repetition_count: number;

  @ApiProperty({
    description: 'Ease factor for spaced repetition algorithm',
    example: 2.5,
  })
  @Column()
  ease_factor: number;

  @ApiProperty({ description: 'Next scheduled review date' })
  @Column()
  next_due_at: Date;

  @ApiProperty({ description: 'Last review timestamp' })
  @Column()
  last_reviewed_at: Date;

  @ApiProperty({ description: 'Creation timestamp' })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @UpdateDateColumn()
  updated_at: Date;
}
