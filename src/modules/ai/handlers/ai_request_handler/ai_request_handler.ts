import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import { v4 } from 'uuid';
import { OpenAiService } from '@/modules/global/services/open_ai_api_service/open_ai_service';
import { AiRequestLogRepository } from '@/modules/ai/repositories/ai_request_log_repository';
import { AiRequestLogEntity } from '@/modules/ai/entities/ai_request_log_entity';

type MODELS = 'gpt-4.1-mini' | 'gpt-4.1-nano' | 'gpt-5-mini';

@Injectable()
export class AiRequestHandler {
  constructor(
    private readonly open_ai_service: OpenAiService,
    private readonly ai_request_log_repository: AiRequestLogRepository,
  ) {}

  /**
   * Calculates estimated cost based on model and token usage
   */
  private calculate_estimated_cost(params: {
    model: MODELS;
    input_tokens: number;
    output_tokens: number;
  }): string {
    // Pricing per 1M tokens (input/output)
    const MODEL_PRICING: Record<MODELS, { input: number; output: number }> = {
      'gpt-4.1-mini': { input: 0.15, output: 0.6 },
      'gpt-4.1-nano': { input: 0.1, output: 0.4 },
      'gpt-5-mini': { input: 0.2, output: 0.8 },
    };

    const pricing = MODEL_PRICING[params.model];
    const input_cost = (params.input_tokens / 1_000_000) * pricing.input;
    const output_cost = (params.output_tokens / 1_000_000) * pricing.output;

    return String(input_cost + output_cost);
  }

  async generate<T extends z.ZodTypeAny>(params: {
    handler_name: string;
    schema: T;
    system: string;
    model: MODELS;
    prompt: string;
    user_id: string;
  }): Promise<z.infer<T>> {
    const start_time = Date.now();
    const { handler_name, user_id } = params;

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

      const log_entity: AiRequestLogEntity = {
        id: v4(),
        user_id,
        handler_name,
        model: params.model,
        input_tokens,
        output_tokens,
        estimated_cost_usd,
        process_duration_ms,
        status: 'success',
        error_message: null,
        created_at: new Date(),
      };

      await this.ai_request_log_repository.save(log_entity);

      return result.response;
    } catch (error) {
      const process_duration_ms = Date.now() - start_time;
      const error_message =
        error instanceof Error ? error.message : String(error);

      const log_entity: AiRequestLogEntity = {
        id: v4(),
        user_id,
        handler_name,
        model: params.model,
        input_tokens: 0,
        output_tokens: 0,
        estimated_cost_usd: '0',
        process_duration_ms,
        status: 'error',
        error_message,
        created_at: new Date(),
      };

      await this.ai_request_log_repository.save(log_entity);

      throw error;
    }
  }
}
