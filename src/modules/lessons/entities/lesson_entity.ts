import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity({ name: 'lessons' })
export class LessonEntity {
  @ApiProperty({ description: 'Unique identifier of the lesson' })
  @PrimaryColumn()
  id: string;

  @ApiProperty({ description: 'Name of the lesson' })
  @Column()
  name: string;

  @ApiProperty({ description: 'ID of the deck this lesson belongs to' })
  @Column()
  deck_id: string;

  @ApiProperty({
    description: 'Position of the lesson for ordering',
    example: 0,
  })
  @Column()
  position: number;

  @ApiProperty({
    description: 'Array of card IDs in the lesson',
    type: [String],
  })
  @Column('text', { array: true })
  cards: string[];

  @ApiProperty({
    description: 'Creation timestamp',
    type: String,
    format: 'date-time',
  })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    type: String,
    format: 'date-time',
  })
  @UpdateDateColumn()
  updated_at: Date;
}
