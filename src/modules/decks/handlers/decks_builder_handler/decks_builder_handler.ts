import { Injectable } from '@nestjs/common';
import { OpenAiService } from '@/modules/global/services/open_ai_api_service/open_ai_service';
import {
  DecksBuilderDto,
  DecksBuilderOutputDto,
} from '@/modules/decks/dtos/decks_builder_dto';

type decks_dtos = {
  builder: {
    input: DecksBuilderDto & { user_id: string };
    output: DecksBuilderOutputDto;
  };
};

@Injectable()
export class DecksBuilderHandler
  implements
    Handler<decks_dtos['builder']['input'], decks_dtos['builder']['output']>
{
  constructor(private readonly open_ai_service: OpenAiService) {}

  async execute(
    params: decks_dtos['builder']['input'],
  ): Promise<decks_dtos['builder']['output']> {
    const result = await this.open_ai_service.deck_builder({
      deck: params.deck,
      cards: params.cards,
      lessons: params.lessons,
      prompt: params.prompt,
    });

    return {
      deck: result.deck,
      cards: result.cards,
      lessons: result.lessons,
    };
  }
}
