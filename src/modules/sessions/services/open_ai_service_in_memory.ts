import { Injectable } from '@nestjs/common';
import { OpenAiService } from '@/modules/sessions/services/open_ai_service';

@Injectable()
export class OpenAiServiceInMemory extends OpenAiService {
  async explain_sentence(params: {
    sentence_to_explain: string;
    language_of_sentence: string;
    language_of_the_explanation: string;
  }): Promise<{ explanation: string }> {
    // Mock implementation for testing
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
}
