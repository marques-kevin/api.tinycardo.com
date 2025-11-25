import { Injectable } from '@nestjs/common';
import {
  DecksGenerateDescriptionDto,
  DecksGenerateDescriptionOutputDto,
} from '@/modules/decks/dtos/decks_generate_description_dto';
import z from 'zod';
import { AiRequestHandler } from '@/modules/ai/handlers/ai_request_handler/ai_request_handler';

type Dto = {
  input: WithUserId<DecksGenerateDescriptionDto>;
  output: DecksGenerateDescriptionOutputDto;
};

@Injectable()
export class DecksGenerateDescriptionHandler
  implements Handler<Dto['input'], Dto['output']>
{
  constructor(private readonly global_ai_handler: AiRequestHandler) {}

  build_generate_description_schema(params: {
    name: string;
    cards: Array<{ front: string; back: string }>;
    front_language: string;
    back_language: string;
  }) {
    const schema = z.object({
      description: z.string().describe('Description of the deck'),
    });
    const system = `
    You are a language learning deck description assistant. 
    You will receive a deck with its name and cards, and you will need to generate a description for it. 
    The front language is the main language of the deck. So use it to generate the description.
    Maximum 500 characters.`;

    const prompt = JSON.stringify({
      name: params.name,
      cards: params.cards,
      front_language: params.front_language,
      back_language: params.back_language,
    });

    return {
      schema: schema,
      system: system,
      model: 'gpt-4.1-mini' as const,
      prompt: prompt,
    };
  }

  async execute(params: Dto['input']): Promise<Dto['output']> {
    const { description } = await this.global_ai_handler.generate({
      handler_name: 'DecksGenerateDescriptionHandler',
      ...this.build_generate_description_schema(params),
      user_id: params.user_id,
    });

    return {
      description,
    };
  }
}
