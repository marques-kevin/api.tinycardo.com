import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const StreakAddStreakSchema = z.object({
  timezone: z
    .string()
    .optional()
    .describe('User timezone (e.g., America/New_York)'),
});

export class StreakAddStreakDto extends createZodDto(StreakAddStreakSchema) {}
