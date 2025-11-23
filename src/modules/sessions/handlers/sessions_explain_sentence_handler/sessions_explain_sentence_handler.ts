import { Injectable } from '@nestjs/common';
import { OpenAiService } from '@/modules/global/services/open_ai_api_service/open_ai_service';
import z from 'zod';

type Dto = {
  input: {
    sentence_to_explain: string;
    language_of_sentence: string;
    language_of_the_explanation: string;
  };
  output: {
    explanation: string;
  };
};

@Injectable()
export class SessionsExplainSentenceHandler
  implements Handler<Dto['input'], Dto['output']>
{
  constructor(private readonly open_ai_service: OpenAiService) {}

  generate_params(params: Dto['input']) {
    return {
      schema: z.object({
        markdown_explanation: z
          .string()
          .describe(
            'A comprehensive explanation of the sentence in well-formatted Markdown, including translation, grammar analysis, vocabulary, examples, and cultural notes',
          ),
      }),
      system: `
        You are a language learning assistant. 
        I'll give you a sentence and you'll need to explain it in details. 
        In params, I'll give you the sentence and the language of the sentence and the language of the explanation. 
        Use markdown as response. As titles, strong etc... 
        Do not include tables.
      `,
      model: 'gpt-4.1-mini' as const,
      prompt: JSON.stringify(params),
    };
  }

  async execute(params: Dto['input']): Promise<Dto['output']> {
    // TODO: only premium users
    // TODO: rate limit
    // Quota per user
    const result = await this.open_ai_service.generate({
      ...this.generate_params(params),
    });

    return {
      explanation: result.markdown_explanation,
    };
  }
}
