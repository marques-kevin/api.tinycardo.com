import { Injectable } from '@nestjs/common';
import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import { OpenAiService } from '@/modules/global/services/open_ai_api_service/open_ai_service';
import { DecksBuilderSchema } from '@/modules/decks/dtos/decks_builder_dto';

const ExplanationSchema = z.object({
  markdown_explanation: z
    .string()
    .describe(
      'A comprehensive explanation of the sentence in well-formatted Markdown, including translation, grammar analysis, vocabulary, examples, and cultural notes',
    ),
});

@Injectable()
export class OpenAiServiceApi extends OpenAiService {
  async explain_sentence(params: {
    sentence_to_explain: string;
    language_of_sentence: string;
    language_of_the_explanation: string;
  }): Promise<{ explanation: string }> {
    const { object } = await generateObject({
      model: openai('gpt-4.1-nano'),
      schema: ExplanationSchema,
      system: `You are a language learning assistant. I'll give you a sentence and you'll need to explain it in details. In params, I'll give you the sentence and the language of the sentence and the language of the explanation. Use markdown as response. As titles, strong etc... Do not include tables.`,
      prompt: JSON.stringify(params),
    });

    return { explanation: object.markdown_explanation };
  }

  private deck_builder_prompt = `
  You are a language learning deck builder assistant. You will receive a deck with its cards and lessons, along with a prompt describing how to update it. You must return the updated deck, cards, and lessons based on the prompt. 

  Important rules:
    - Keep all IDs unchanged (card.id, lesson.id, etc.)
    - Maintain the structure and relationships between entities
    - Update only the fields that need to be changed based on the prompt
    - Ensure all card IDs referenced in lessons exist in the cards array
    - Preserve timestamps (created_at, updated_at) as they are

  Return response in JSON format like the same I send you in params.
`;

  private deck_builder_response_schema = z.object({
    deck: DecksBuilderSchema['shape']['deck'],
    cards: DecksBuilderSchema['shape']['cards'],
    lessons: DecksBuilderSchema['shape']['lessons'],
  });

  async deck_builder(
    params: Parameters<OpenAiService['deck_builder']>[0],
  ): ReturnType<OpenAiService['deck_builder']> {
    const { object } = await generateObject({
      model: openai('gpt-4.1-mini'),
      schema: this.deck_builder_response_schema,
      system: this.deck_builder_prompt,
      prompt: JSON.stringify(params),
    });

    console.log(object);

    return {
      deck: object.deck,
      cards: object.cards,
      lessons: object.lessons,
    };
  }
}
