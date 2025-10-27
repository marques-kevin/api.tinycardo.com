import { Column, Entity, PrimaryColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity({ name: 'streaks' })
export class StreakEntity {
  @ApiProperty({ description: 'The streak id' })
  @PrimaryColumn()
  id: string;

  @ApiProperty({ description: 'The user id' })
  @Column()
  user_id: string;

  @ApiProperty({ description: 'The date of the streak (YYYY-MM-DD)' })
  @Column({ type: 'varchar' })
  date: string;
}
