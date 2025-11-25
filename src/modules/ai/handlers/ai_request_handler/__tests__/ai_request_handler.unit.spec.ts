import { create_testing_module } from '@/tests/create_testing_module';
import { AiRequestHandler } from '@/modules/ai/handlers/ai_request_handler/ai_request_handler';
import { OpenAiService } from '@/modules/global/services/open_ai_api_service/open_ai_service';
import { OpenAiServiceInMemory } from '@/modules/global/services/open_ai_api_service/open_ai_service_in_memory';
import { AiRequestLogRepository } from '@/modules/ai/repositories/ai_request_log_repository';
import { z } from 'zod';

describe('ai_request_handler', () => {
  let handler: AiRequestHandler;
  let open_ai_service: OpenAiServiceInMemory;
  let ai_request_log_repository: AiRequestLogRepository;

  beforeEach(async () => {
    const module = await create_testing_module();
    handler = module.get(AiRequestHandler);
    open_ai_service = module.get(OpenAiService);
    ai_request_log_repository = module.get(AiRequestLogRepository);
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should generate response and save success log entry', async () => {
    const schema = z.object({
      description: z.string(),
    });

    const params = {
      handler_name: 'TestHandler',
      schema,
      system: 'You are a helpful assistant',
      model: 'gpt-4.1-mini' as const,
      prompt: 'Generate a description',
      user_id: 'user-1',
    };

    const expected_response = {
      description: 'Test description',
    };

    open_ai_service.generate_responses.push({
      schema: params.schema,
      system: params.system,
      model: params.model,
      prompt: params.prompt,
      response: expected_response,
    });

    const result = await handler.generate(params);

    expect(result).toEqual(expected_response);

    // Verify log was saved
    const all_logs = await ai_request_log_repository.find_all({
      where: { user_id: params.user_id, handler_name: params.handler_name },
    });

    expect(all_logs.length).toBe(1);
    const log_entry = all_logs[0];
    expect(log_entry.status).toBe('success');
    expect(log_entry.model).toBe(params.model);
    expect(log_entry.input_tokens).toBe(0); // OpenAiServiceInMemory returns 0 tokens
    expect(log_entry.output_tokens).toBe(0); // OpenAiServiceInMemory returns 0 tokens
    expect(log_entry.error_message).toBeNull();
    expect(log_entry.estimated_cost_usd).toBeDefined();
    expect(log_entry.process_duration_ms).toBeGreaterThanOrEqual(0);
  });

  it('should handle errors and save error log entry', async () => {
    const schema = z.object({
      description: z.string(),
    });

    const params = {
      handler_name: 'TestHandler',
      schema,
      system: 'You are a helpful assistant',
      model: 'gpt-4.1-nano' as const,
      prompt: 'Generate a description',
      user_id: 'user-2',
    };

    // Don't add a response to open_ai_service, so it will throw an error

    await expect(handler.generate(params)).rejects.toThrow();

    // Verify error log was saved
    const all_logs = await ai_request_log_repository.find_all({
      where: { user_id: params.user_id, handler_name: params.handler_name },
    });

    expect(all_logs.length).toBe(1);
    const log_entry = all_logs[0];
    expect(log_entry.status).toBe('error');
    expect(log_entry.model).toBe(params.model);
    expect(log_entry.input_tokens).toBe(0);
    expect(log_entry.output_tokens).toBe(0);
    expect(log_entry.error_message).toBeDefined();
    expect(log_entry.estimated_cost_usd).toBe('0');
    expect(log_entry.process_duration_ms).toBeGreaterThanOrEqual(0);
  });
});
