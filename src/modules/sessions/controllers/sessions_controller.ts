import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/modules/authentication/guards/jwt.guard';
import { SessionsExplainSentenceHandler } from '@/modules/sessions/handlers/sessions_explain_sentence_handler/sessions_explain_sentence_handler';

@Controller('/sessions')
export class SessionsController {
  constructor(
    private readonly explain_sentence_handler: SessionsExplainSentenceHandler,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('/explain_sentence')
  async explain_sentence(
    @Body()
    body: {
      sentence_to_explain: string;
      language_of_sentence: string;
      language_of_the_explanation: string;
    },
  ) {
    return this.explain_sentence_handler.execute({
      sentence_to_explain: body.sentence_to_explain,
      language_of_sentence: body.language_of_sentence,
      language_of_the_explanation: body.language_of_the_explanation,
    });
  }
}
