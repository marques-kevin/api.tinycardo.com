import { ApiProperty } from '@nestjs/swagger';

export class LessonsUpsertLessonsOutputLessonDto {
  @ApiProperty({ description: 'ID of the lesson' })
  id: string;

  @ApiProperty({ description: 'ID of the deck the lesson belongs to' })
  deck_id: string;

  @ApiProperty({
    description: 'Name of the lesson',
    minLength: 1,
    maxLength: 255,
  })
  name: string;

  @ApiProperty({ description: 'Position of the lesson', minimum: 0 })
  position: number;

  @ApiProperty({
    description: 'Array of card IDs in the lesson',
    type: [String],
  })
  cards: string[];

  @ApiProperty({
    description: 'Creation timestamp',
    type: String,
    format: 'date-time',
  })
  created_at: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    type: String,
    format: 'date-time',
  })
  updated_at: Date;
}

export class LessonsUpsertLessonsOutputDto {
  @ApiProperty({ description: 'Number of lessons saved', minimum: 0 })
  lessons_saved: number;

  @ApiProperty({ description: 'Number of lessons removed', minimum: 0 })
  lessons_removed: number;

  @ApiProperty({
    description: 'List of lessons that were saved or updated',
    type: [LessonsUpsertLessonsOutputLessonDto],
  })
  lessons: LessonsUpsertLessonsOutputLessonDto[];
}
