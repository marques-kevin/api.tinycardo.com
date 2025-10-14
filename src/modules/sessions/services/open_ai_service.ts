export abstract class OpenAiService {
  abstract explain_sentence(params: {
    sentence_to_explain: string;
    language_of_sentence: string;
    language_of_the_explanation: string;
  }): Promise<{
    explanation: string;
  }>;
}
