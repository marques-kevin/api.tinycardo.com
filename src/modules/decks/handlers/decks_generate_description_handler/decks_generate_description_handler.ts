import { Injectable } from '@nestjs/common';
import { OpenAiService } from '@/modules/global/services/open_ai_api_service/open_ai_service';
import {
  DecksGenerateDescriptionDto,
  DecksGenerateDescriptionOutputDto,
} from '@/modules/decks/dtos/decks_generate_description_dto';
import z from 'zod';
import { DecksCheckAccessHandler } from '@/modules/decks/handlers/decks_check_access_handler/decks_check_access_handler';

type Dto = {
  input: WithUserId<DecksGenerateDescriptionDto>;
  output: DecksGenerateDescriptionOutputDto;
};

@Injectable()
export class DecksGenerateDescriptionHandler
  implements Handler<Dto['input'], Dto['output']>
{
  constructor(
    private readonly open_ai_service: OpenAiService,
    private readonly decks_check_access_handler: DecksCheckAccessHandler,
  ) {}

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
    // TODO: only premium users
    // TODO: rate limit
    // Quota per user
    await this.decks_check_access_handler.execute({
      deck_id: params.deck_id,
      user_id: params.user_id,
      level: 'owner',
    });

    const { description } = await this.open_ai_service.generate(
      this.build_generate_description_schema(params),
    );

    return {
      description: description,
    };
  }
}
