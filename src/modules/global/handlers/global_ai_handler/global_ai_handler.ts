import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import { OpenAiService } from '@/modules/global/services/open_ai_api_service/open_ai_service';

type MODELS = 'gpt-4.1-mini' | 'gpt-4.1-nano' | 'gpt-5-mini';

@Injectable()
export class GlobalAiHandler {
  constructor(private readonly open_ai_service: OpenAiService) {}

  /**
   * Calculates estimated cost based on model and token usage
   */
  private calculate_estimated_cost(params: {
    model: MODELS;
    input_tokens: number;
    output_tokens: number;
  }): number {
    // Pricing per 1M tokens (input/output)
    const MODEL_PRICING: Record<MODELS, { input: number; output: number }> = {
      'gpt-4.1-mini': { input: 0.15, output: 0.6 },
      'gpt-4.1-nano': { input: 0.1, output: 0.4 },
      'gpt-5-mini': { input: 0.2, output: 0.8 },
    };

    const pricing = MODEL_PRICING[params.model];
    const input_cost = (params.input_tokens / 1_000_000) * pricing.input;
    const output_cost = (params.output_tokens / 1_000_000) * pricing.output;

    return input_cost + output_cost;
  }

  async generate<T extends z.ZodTypeAny>(params: {
    handler_name: string;
    schema: T;
    system: string;
    model: MODELS;
    prompt: string;
  }): Promise<z.infer<T>> {
    const start_time = Date.now();
    const { handler_name } = params;

    try {
      const result = await this.open_ai_service.generate({
        schema: params.schema,
        system: params.system,
        model: params.model,
        prompt: params.prompt,
      });

      const process_duration_ms = Date.now() - start_time;
      const { input_tokens, output_tokens } = result.usage;

      const estimated_cost_usd = this.calculate_estimated_cost({
        model: params.model,
        input_tokens,
        output_tokens,
      });

      // Log AI request
      const log_data = {
        handler_name,
        model: params.model,
        input_tokens,
        output_tokens,
        estimated_cost_usd,
        process_duration_ms,
        status: 'success',
        created_at: new Date().toISOString(),
      };

      console.log('[AI Request]', JSON.stringify(log_data, null, 2));

      return result.response;
    } catch (error) {
      const process_duration_ms = Date.now() - start_time;
      const error_message =
        error instanceof Error ? error.message : String(error);

      // Log AI request error
      const log_data = {
        handler_name,
        model: params.model,
        prompt_tokens: 0,
        completion_tokens: 0,
        total_tokens: 0,
        estimated_cost_usd: 0,
        process_duration_ms,
        status: 'error',
        error_message,
        created_at: new Date().toISOString(),
      };

      console.error('[AI Request Error]', JSON.stringify(log_data, null, 2));

      throw error;
    }
  }
}
