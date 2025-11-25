import { z } from 'zod';

export abstract class OpenAiService {
  abstract generate<T extends z.ZodTypeAny>(params: {
    schema: T;
    system: string;
    model: 'gpt-4.1-mini' | 'gpt-4.1-nano' | 'gpt-5-mini';
    prompt: string;
  }): Promise<{
    response: z.infer<T>;
    usage: {
      input_tokens: number;
      output_tokens: number;
    };
  }>;
}
