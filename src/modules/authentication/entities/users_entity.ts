import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity({ name: 'users' })
export class UsersEntity {
  @ApiProperty({ description: 'Unique identifier of the user' })
  @PrimaryColumn()
  id: string;

  @ApiProperty({ description: 'Email address of the user' })
  @Column({ unique: true })
  email: string;

  @ApiProperty({ description: 'Preferred language of the user', default: 'en' })
  @Column({ default: 'en' })
  language: string;

  @ApiProperty({ description: 'Creation timestamp' })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @UpdateDateColumn()
  updated_at: Date;
}
