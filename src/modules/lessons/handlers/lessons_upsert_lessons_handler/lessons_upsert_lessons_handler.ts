import { Injectable } from '@nestjs/common';
import { LessonsRepository } from '@/modules/lessons/repositories/lessons_repository';
import { DecksRepository } from '@/modules/decks/repositories/decks_repository';
import { LessonEntity } from '@/modules/lessons/entities/lesson_entity';
import { v4 } from 'uuid';

type lessons_dtos = {
  upsert_lessons: {
    input: {
      user_id: string;
      deck_id: string;
      lessons: Array<{
        id?: string;
        name: string;
        position: number;
        cards?: string[];
      }>;
    };
    output: {
      lessons_saved: number;
      lessons_removed: number;
      lessons: LessonEntity[];
    };
  };
};

@Injectable()
export class LessonsUpsertLessonsHandler
  implements
    Handler<
      lessons_dtos['upsert_lessons']['input'],
      lessons_dtos['upsert_lessons']['output']
    >
{
  constructor(
    private readonly lessons_repository: LessonsRepository,
    private readonly decks_repository: DecksRepository,
  ) {}

  private async ensure_user_has_access_to_deck(params: {
    user_id: string;
    deck_id: string;
  }) {
    const deck = await this.decks_repository.find_by_id(params.deck_id);

    if (!deck || deck.user_id !== params.user_id) {
      throw new Error('Deck not found');
    }

    return deck;
  }

  async execute(
    params: lessons_dtos['upsert_lessons']['input'],
  ): Promise<lessons_dtos['upsert_lessons']['output']> {
    await this.ensure_user_has_access_to_deck({
      user_id: params.user_id,
      deck_id: params.deck_id,
    });

    const existing_lessons = await this.lessons_repository.find_all({
      where: { deck_id: params.deck_id },
    });

    const lessons_to_save: LessonEntity[] = [];
    const lessons_to_remove: LessonEntity[] = [];

    for (const lesson of params.lessons) {
      const existing = lesson.id
        ? existing_lessons.find((l) => l.id === lesson.id)
        : undefined;

      const timestamp = new Date();

      const lesson_to_save: LessonEntity = {
        id: existing ? existing.id : (lesson.id ?? v4()),
        deck_id: params.deck_id,
        name: lesson.name,
        position: lesson.position,
        cards: lesson.cards ?? (existing ? existing.cards : []),
        created_at: existing ? existing.created_at : timestamp,
        updated_at: timestamp,
      };

      lessons_to_save.push(lesson_to_save);
    }

    for (const lesson of existing_lessons) {
      if (!params.lessons.find((l) => l.id === lesson.id)) {
        lessons_to_remove.push(lesson);
      }
    }

    const saved_lessons = await Promise.all(
      lessons_to_save.map((lesson) => this.lessons_repository.save(lesson)),
    );

    await Promise.all(
      lessons_to_remove.map((lesson) =>
        this.lessons_repository.delete(lesson.id),
      ),
    );

    return {
      lessons_saved: saved_lessons.length,
      lessons_removed: lessons_to_remove.length,
      lessons: saved_lessons,
    };
  }
}
