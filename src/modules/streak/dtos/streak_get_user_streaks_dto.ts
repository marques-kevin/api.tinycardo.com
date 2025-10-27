import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const StreakGetUserStreaksSchema = z.object({});

export class StreakGetUserStreaksDto extends createZodDto(
  StreakGetUserStreaksSchema,
) {}
