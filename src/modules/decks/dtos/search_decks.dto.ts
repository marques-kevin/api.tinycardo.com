import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const SearchDecksSchema = z.object({
  limit: z
    .number()
    .int()
    .positive()
    .max(100)
    .optional()
    .describe('Number of results per page'),
  page: z.number().int().positive().optional().describe('Page number'),
  front_language: z
    .string()
    .min(2)
    .max(10)
    .optional()
    .describe('Filter by front language'),
  back_language: z
    .string()
    .min(2)
    .max(10)
    .optional()
    .describe('Filter by back language'),
  title: z
    .string()
    .min(1)
    .max(255)
    .optional()
    .describe('Search by title (partial match)'),
});

export class SearchDecksDto extends createZodDto(SearchDecksSchema) {}
