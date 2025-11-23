import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import { OpenAiService } from '@/modules/global/services/open_ai_api_service/open_ai_service';

@Injectable()
export class OpenAiServiceInMemory extends OpenAiService {
  public generate_responses: Array<{
    schema: z.ZodTypeAny;
    system: string;
    model: string;
    prompt: string;
    response: z.infer<z.ZodTypeAny>;
  }> = [];

  async generate<T extends z.ZodTypeAny>(params: {
    schema: T;
    system: string;
    model: string;
    prompt: string;
  }): Promise<z.infer<T>> {
    const response_found = this.generate_responses.find(
      (response) =>
        response.system === params.system &&
        response.model === params.model &&
        response.prompt === params.prompt,
    );

    if (!response_found) {
      throw new Error('Response not found');
    }

    return response_found.response as z.infer<T>;
  }
}
