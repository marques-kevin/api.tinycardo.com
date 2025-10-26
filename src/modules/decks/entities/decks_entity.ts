import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity({ name: 'decks' })
export class DecksEntity {
  @ApiProperty({ description: 'Unique identifier of the deck' })
  @PrimaryColumn()
  id: string;

  @ApiProperty({ description: 'Name of the deck' })
  @Column()
  name: string;

  @ApiProperty({ description: 'Description of the deck' })
  @Column()
  description: string;

  @ApiProperty({ description: 'User ID who owns the deck' })
  @Column()
  user_id: string;

  @ApiProperty({ description: 'Language of the front side of cards' })
  @Column()
  front_language: string;

  @ApiProperty({ description: 'Language of the back side of cards' })
  @Column()
  back_language: string;

  @ApiProperty({ description: 'Public visibility of the deck' })
  @Column({ type: 'varchar', length: 255 })
  visibility: 'public' | 'private' | 'unlisted';

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

  @ApiProperty({
    description: 'Deletion timestamp (null if not deleted)',
    type: String,
    format: 'date-time',
    nullable: true,
  })
  @DeleteDateColumn()
  deleted_at: Date | null;
}
