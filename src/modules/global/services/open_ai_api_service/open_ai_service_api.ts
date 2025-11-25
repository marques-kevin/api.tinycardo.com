import { Injectable } from '@nestjs/common';
import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import { OpenAiService } from '@/modules/global/services/open_ai_api_service/open_ai_service';

@Injectable()
export class OpenAiServiceApi extends OpenAiService {
  async generate<T extends z.ZodTypeAny>(
    params: Parameters<OpenAiService['generate']>[0],
  ): Promise<{
    response: z.infer<T>;
    usage: { input_tokens: number; output_tokens: number };
  }> {
    const { object, usage } = await generateObject({
      model: openai(params.model),
      schema: params.schema,
      system: params.system,
      prompt: params.prompt,
    });

    return {
      response: object as z.infer<T>,
      usage: {
        input_tokens: usage.inputTokens ?? 0,
        output_tokens: usage.outputTokens ?? 0,
      },
    };
  }
}
