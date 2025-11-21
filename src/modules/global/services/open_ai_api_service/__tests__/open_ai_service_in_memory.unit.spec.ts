import { OpenAiServiceInMemory } from '@/modules/global/services/open_ai_api_service/open_ai_service_in_memory';
import { DecksEntity } from '@/modules/decks/entities/decks_entity';
import { CardsEntity } from '@/modules/cards/entities/cards_entity';
import { LessonEntity } from '@/modules/lessons/entities/lesson_entity';

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

  describe('deck_builder', () => {
    const mockDeck: DecksEntity = {
      id: 'deck-1',
      name: 'Test Deck',
      description: 'Test Description',
      user_id: 'user-1',
      front_language: 'English',
      back_language: 'Spanish',
      visibility: 'private',
      created_at: new Date('2024-01-01'),
      updated_at: new Date('2024-01-01'),
      deleted_at: null,
    };

    const mockCards: CardsEntity[] = [
      {
        id: 'card-1',
        deck_id: 'deck-1',
        front: 'Hello',
        back: 'Hola',
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-01'),
      },
    ];

    const mockLessons: LessonEntity[] = [
      {
        id: 'lesson-1',
        name: 'Introduction',
        deck_id: 'deck-1',
        position: 0,
        cards: ['card-1'],
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-01'),
      },
    ];

    it('should return deck, cards, and lessons', async () => {
      const result = await service.deck_builder({
        deck: mockDeck,
        cards: mockCards,
        lessons: mockLessons,
        prompt: 'Add a new card',
      });

      expect(result).toBeDefined();
      expect(result.deck).toBeDefined();
      expect(result.cards).toBeDefined();
      expect(result.lessons).toBeDefined();
      expect(Array.isArray(result.cards)).toBe(true);
      expect(Array.isArray(result.lessons)).toBe(true);
    });

    it('should preserve the original deck', async () => {
      const result = await service.deck_builder({
        deck: mockDeck,
        cards: mockCards,
        lessons: mockLessons,
        prompt: 'Test prompt',
      });

      expect(result.deck.name).toBe(mockDeck.name);
      expect(result.deck.description).toBe(mockDeck.description);
      expect(result.deck.front_language).toBe(mockDeck.front_language);
      expect(result.deck.back_language).toBe(mockDeck.back_language);
    });

    it('should preserve original cards and add a new card', async () => {
      const result = await service.deck_builder({
        deck: mockDeck,
        cards: mockCards,
        lessons: mockLessons,
        prompt: 'Add a new card',
      });

      expect(result.cards.length).toBe(mockCards.length + 1);
      expect(result.cards[0]).toEqual(mockCards[0]);
      expect(result.cards[1].front).toBe('Front');
      expect(result.cards[1].back).toBe('Back');
    });

    it('should preserve original lessons and add a new lesson', async () => {
      const result = await service.deck_builder({
        deck: mockDeck,
        cards: mockCards,
        lessons: mockLessons,
        prompt: 'Add a new lesson',
      });

      expect(result.lessons.length).toBe(mockLessons.length + 1);
      expect(result.lessons[0]).toEqual(mockLessons[0]);
      expect(result.lessons[1].name).toBe('Lesson 1');
      expect(result.lessons[1].position).toBe(1);
    });

    it('should ensure new lesson references the new card', async () => {
      const result = await service.deck_builder({
        deck: mockDeck,
        cards: mockCards,
        lessons: mockLessons,
        prompt: 'Test',
      });

      const newCard = result.cards[result.cards.length - 1];
      const newLesson = result.lessons[result.lessons.length - 1];
      expect(newLesson.cards).toContain(newCard.id);
    });

    it('should work with empty cards and lessons arrays', async () => {
      const result = await service.deck_builder({
        deck: mockDeck,
        cards: [],
        lessons: [],
        prompt: 'Create new content',
      });

      expect(result.cards.length).toBe(1);
      expect(result.lessons.length).toBe(1);
    });
  });
});
