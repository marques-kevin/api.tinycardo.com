import { Injectable } from '@nestjs/common';
import { OpenAiService } from '@/modules/global/services/open_ai_api_service/open_ai_service';

type sessions_dtos = {
  explain_sentence: {
    input: {
      sentence_to_explain: string;
      language_of_sentence: string;
      language_of_the_explanation: string;
    };
    output: {
      explanation: string;
    };
  };
};

@Injectable()
export class SessionsExplainSentenceHandler
  implements
    Handler<
      sessions_dtos['explain_sentence']['input'],
      sessions_dtos['explain_sentence']['output']
    >
{
  constructor(private readonly open_ai_service: OpenAiService) {}

  async execute(
    params: sessions_dtos['explain_sentence']['input'],
  ): Promise<sessions_dtos['explain_sentence']['output']> {
    const result = await this.open_ai_service.explain_sentence({
      sentence_to_explain: params.sentence_to_explain,
      language_of_sentence: params.language_of_sentence,
      language_of_the_explanation: params.language_of_the_explanation,
    });

    return {
      explanation: result.explanation,
    };
  }
}
