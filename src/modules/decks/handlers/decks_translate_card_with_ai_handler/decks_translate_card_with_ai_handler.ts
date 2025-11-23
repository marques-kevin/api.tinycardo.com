import { Injectable } from '@nestjs/common';
import { OpenAiService } from '@/modules/global/services/open_ai_api_service/open_ai_service';
import {
  DecksTranslateCardWithAiDto,
  DecksTranslateCardWithAiOutputDto,
} from '@/modules/decks/dtos/decks_translate_card_with_ai_dto';
import z from 'zod';

type Dto = {
  input: DecksTranslateCardWithAiDto;
  output: DecksTranslateCardWithAiOutputDto;
};

@Injectable()
export class DecksTranslateCardWithAiHandler
  implements Handler<Dto['input'], Dto['output']>
{
  constructor(private readonly open_ai_service: OpenAiService) {}

  build_translate_schema(params: {
    front: string;
    back: string;
    front_language: string;
    back_language: string;
  }) {
    const schema = z.object({
      translation: z.string().describe('The translation of the front text'),
    });
    const system = `
    You are a flashcard app language translation assistant. 
    You will receive {front: string, back: string} that contains the front and back text of the card.
    Take the front text and translate it to the back language.
    The front language is ${params.front_language}.
    The back language is ${params.back_language}.
    Provide only the translation, without additional explanations or context.

    Return {translation: string}
    `;

    const prompt = JSON.stringify({
      front: params.front,
      back: params.back,
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
    const { translation } = await this.open_ai_service.generate(
      this.build_translate_schema(params),
    );

    return {
      front: params.front,
      back: translation,
    };
  }
}
