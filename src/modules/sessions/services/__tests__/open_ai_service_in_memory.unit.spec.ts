import { OpenAiServiceInMemory } from '@/modules/sessions/services/open_ai_service_in_memory';

describe('open_ai_service_in_memory', () => {
  let service: OpenAiServiceInMemory;

  beforeEach(() => {
    service = new OpenAiServiceInMemory();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return a mock explanation', async () => {
    const result = await service.explain_sentence({
      sentence_to_explain: 'Test sentence',
      language_of_sentence: 'English',
      language_of_the_explanation: 'French',
    });

    expect(result).toBeDefined();
    expect(result.explanation).toBeDefined();
    expect(typeof result.explanation).toBe('string');
  });

  it('should include the sentence in the explanation', async () => {
    const sentence = 'Je voudrais un café';
    const result = await service.explain_sentence({
      sentence_to_explain: sentence,
      language_of_sentence: 'French',
      language_of_the_explanation: 'English',
    });

    expect(result.explanation).toContain(sentence);
  });

  it('should include markdown formatting', async () => {
    const result = await service.explain_sentence({
      sentence_to_explain: 'Test',
      language_of_sentence: 'English',
      language_of_the_explanation: 'Spanish',
    });

    expect(result.explanation).toContain('#');
    expect(result.explanation).toContain('##');
  });

  it('should include grammar, vocabulary, and examples sections', async () => {
    const result = await service.explain_sentence({
      sentence_to_explain: 'Test',
      language_of_sentence: 'English',
      language_of_the_explanation: 'Spanish',
    });

    expect(result.explanation).toContain('Grammar');
    expect(result.explanation).toContain('Vocabulary');
    expect(result.explanation).toContain('Examples');
  });

  it('should include the languages in the explanation', async () => {
    const result = await service.explain_sentence({
      sentence_to_explain: 'Test',
      language_of_sentence: 'Japanese',
      language_of_the_explanation: 'Portuguese',
    });

    expect(result.explanation).toContain('Japanese');
    expect(result.explanation).toContain('Portuguese');
  });
});
