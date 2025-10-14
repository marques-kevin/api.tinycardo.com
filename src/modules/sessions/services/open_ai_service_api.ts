import { Injectable } from '@nestjs/common';
import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import { OpenAiService } from '@/modules/sessions/services/open_ai_service';

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
}
