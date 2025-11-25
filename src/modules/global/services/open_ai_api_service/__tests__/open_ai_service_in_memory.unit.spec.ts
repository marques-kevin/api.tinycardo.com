import { OpenAiServiceInMemory } from '@/modules/global/services/open_ai_api_service/open_ai_service_in_memory';
import { z } from 'zod';

describe('open_ai_service_in_memory', () => {
  let service: OpenAiServiceInMemory;

  beforeEach(() => {
    service = new OpenAiServiceInMemory();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return the matching response when found', async () => {
    const schema = z.object({
      description: z.string(),
    });
    const system = 'Test system prompt';
    const model = 'gpt-4.1-mini';
    const prompt = 'Test prompt';
    const expectedResponse = { description: 'Test description' };

    service.generate_responses.push({
      schema,
      system,
      model,
      prompt,
      response: expectedResponse,
    });

    const result = await service.generate({
      schema,
      system,
      model,
      prompt,
    });

    expect(result).toMatchObject({
      response: expectedResponse,
    });
  });

  it('should throw error when no matching response is found', async () => {
    const schema = z.object({
      description: z.string(),
    });

    await expect(
      service.generate({
        schema,
        system: 'Non-existent system',
        model: 'gpt-4.1-mini',
        prompt: 'Non-existent prompt',
      }),
    ).rejects.toThrow('Response not found');
  });

  it('should match based on schema, system, model, and prompt', async () => {
    const schema1 = z.object({
      description: z.string(),
    });
    const schema2 = z.object({
      title: z.string(),
    });
    const system = 'Test system';
    const model = 'gpt-4.1-mini';
    const prompt1 = 'Prompt 1';
    const prompt2 = 'Prompt 2';

    service.generate_responses.push(
      {
        schema: schema1,
        system,
        model,
        prompt: prompt1,
        response: { description: 'Response 1' },
      },
      {
        schema: schema2,
        system,
        model,
        prompt: prompt2,
        response: { title: 'Response 2' },
      },
    );

    const result1 = await service.generate({
      schema: schema1,
      system,
      model,
      prompt: prompt1,
    });
    expect(result1).toMatchObject({ response: { description: 'Response 1' } });

    const result2 = await service.generate({
      schema: schema2,
      system,
      model,
      prompt: prompt2,
    });
    expect(result2).toMatchObject({ response: { title: 'Response 2' } });
  });

  it('should not match when system differs', async () => {
    const schema = z.object({
      description: z.string(),
    });
    const model = 'gpt-4.1-mini';
    const prompt = 'Test prompt';

    service.generate_responses.push({
      schema,
      system: 'System 1',
      model,
      prompt,
      response: { description: 'Test' },
    });

    await expect(
      service.generate({
        schema,
        system: 'System 2',
        model,
        prompt,
      }),
    ).rejects.toThrow('Response not found');
  });

  it('should not match when model differs', async () => {
    const schema = z.object({
      description: z.string(),
    });
    const system = 'Test system';
    const prompt = 'Test prompt';

    service.generate_responses.push({
      schema,
      system,
      model: 'gpt-4.1-mini',
      prompt,
      response: { description: 'Test' },
    });

    await expect(
      service.generate({
        schema,
        system,
        model: 'gpt-4.1-nano',
        prompt,
      }),
    ).rejects.toThrow('Response not found');
  });

  it('should not match when prompt differs', async () => {
    const schema = z.object({
      description: z.string(),
    });
    const system = 'Test system';
    const model = 'gpt-4.1-mini';

    service.generate_responses.push({
      schema,
      system,
      model,
      prompt: 'Prompt 1',
      response: { description: 'Test' },
    });

    await expect(
      service.generate({
        schema,
        system,
        model,
        prompt: 'Prompt 2',
      }),
    ).rejects.toThrow('Response not found');
  });

  it('should work with complex schemas', async () => {
    const schema = z.object({
      description: z.string(),
      tags: z.array(z.string()),
      metadata: z.object({
        language: z.string(),
        difficulty: z.number(),
      }),
    });
    const system = 'Test system';
    const model = 'gpt-4.1-mini';
    const prompt = 'Test prompt';
    const expectedResponse = {
      description: 'Complex response',
      tags: ['tag1', 'tag2'],
      metadata: {
        language: 'en',
        difficulty: 5,
      },
    };

    service.generate_responses.push({
      schema,
      system,
      model,
      prompt,
      response: expectedResponse,
    });

    const result = await service.generate({
      schema,
      system,
      model,
      prompt,
    });

    expect(result).toMatchObject({ response: expectedResponse });
  });
});
