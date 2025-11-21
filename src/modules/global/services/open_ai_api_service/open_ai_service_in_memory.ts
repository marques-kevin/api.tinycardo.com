import { Injectable } from '@nestjs/common';
import { v4 } from 'uuid';
import { OpenAiService } from '@/modules/global/services/open_ai_api_service/open_ai_service';
import { DecksBuilderDto } from '@/modules/decks/dtos/decks_builder_dto';

@Injectable()
export class OpenAiServiceInMemory extends OpenAiService {
  async explain_sentence(params: {
    sentence_to_explain: string;
    language_of_sentence: string;
    language_of_the_explanation: string;
  }): Promise<{ explanation: string }> {
    return {
      explanation: `# Explanation of "${params.sentence_to_explain}"

## Translation
This is a mock translation from ${params.language_of_sentence} to ${params.language_of_the_explanation}.

## Grammar Analysis
- **Tense**: Present tense
- **Structure**: Subject-Verb-Object

## Vocabulary
- Word 1: Definition
- Word 2: Definition

## Examples
1. Example sentence 1
2. Example sentence 2

## Cultural Notes
Some cultural context about the sentence.
`,
    };
  }

  async deck_builder(
    params: Parameters<OpenAiService['deck_builder']>[0],
  ): ReturnType<OpenAiService['deck_builder']> {
    const card_to_create: DecksBuilderDto['cards'][number] = {
      id: v4(),
      front: 'Front',
      back: 'Back',
    };

    const lesson_to_create: DecksBuilderDto['lessons'][number] = {
      id: v4(),
      name: 'Lesson 1',
      position: 1,
      cards: [card_to_create.id],
    };

    return {
      deck: params.deck,
      cards: [...params.cards, card_to_create],
      lessons: [...params.lessons, lesson_to_create],
    };
  }
}
