import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

type MODELS = 'gpt-4.1-mini' | 'gpt-4.1-nano' | 'gpt-5-mini';
type STATUS = 'success' | 'error';

@Entity({ name: 'ai_requests' })
export class AiRequestsEntity {
  @ApiProperty({ description: 'Unique identifier of the AI request' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'User ID who made the request' })
  @Column()
  user_id: string;

  @ApiProperty({ description: 'Handler name that made the request' })
  @Column()
  handler_name: string;

  @ApiProperty({ description: 'AI model used' })
  @Column({ type: 'varchar', length: 100 })
  model: MODELS;

  @ApiProperty({ description: 'Number of input tokens' })
  @Column({ type: 'int' })
  input_tokens: number;

  @ApiProperty({ description: 'Number of output tokens' })
  @Column({ type: 'int' })
  output_tokens: number;

  @ApiProperty({ description: 'Estimated cost in USD' })
  @Column({ type: 'decimal', precision: 10, scale: 6 })
  estimated_cost_usd: number;

  @ApiProperty({ description: 'Process duration in milliseconds' })
  @Column({ type: 'int' })
  process_duration_ms: number;

  @ApiProperty({ description: 'Request status' })
  @Column({ type: 'varchar', length: 20 })
  status: STATUS;

  @ApiProperty({
    description: 'Error message if status is error',
    nullable: true,
  })
  @Column({ type: 'text', nullable: true })
  error_message: string | null;

  @ApiProperty({
    description: 'Creation timestamp',
    type: String,
    format: 'date-time',
  })
  @CreateDateColumn()
  created_at: Date;
}


