import { Injectable } from '@nestjs/common';
import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import { OpenAiService } from '@/modules/global/services/open_ai_api_service/open_ai_service';

@Injectable()
export class OpenAiServiceApi extends OpenAiService {
  async generate<T extends z.ZodTypeAny>(
    params: Parameters<OpenAiService['generate']>[0],
  ): Promise<z.infer<T>> {
    const { object } = await generateObject({
      model: openai(params.model),
      schema: params.schema,
      system: params.system,
      prompt: params.prompt,
    });

    return object as z.infer<T>;
  }
}
