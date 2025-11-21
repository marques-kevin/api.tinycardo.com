import { DecksBuilderDto } from '@/modules/decks/dtos/decks_builder_dto';

export abstract class OpenAiService {
  abstract explain_sentence(params: {
    sentence_to_explain: string;
    language_of_sentence: string;
    language_of_the_explanation: string;
  }): Promise<{
    explanation: string;
  }>;

  abstract deck_builder(params: {
    deck: DecksBuilderDto['deck'];
    cards: DecksBuilderDto['cards'];
    lessons: DecksBuilderDto['lessons'];
    prompt: string;
  }): Promise<{
    deck: DecksBuilderDto['deck'];
    cards: DecksBuilderDto['cards'];
    lessons: DecksBuilderDto['lessons'];
  }>;
}
