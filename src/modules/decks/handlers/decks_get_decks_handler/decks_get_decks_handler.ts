import { Injectable } from '@nestjs/common';
import { DecksRepository } from '@/modules/decks/repositories/decks_repository';
import {
  DecksEntity,
  DecksEntityWithStats,
} from '@/modules/decks/entities/decks_entity';
import { HistoryRepository } from '@/modules/history/repositories/history_repository';
import { CardsRepository } from '@/modules/cards/repositories/cards_repository';
import { HistoryEntity } from '@/modules/history/entities/history_entity';

type decks_dtos = {
  get_decks: {
    input: { user_id: string };
    output: DecksEntityWithStats[];
  };
};

@Injectable()
export class DecksGetDecksHandler
  implements
    Handler<decks_dtos['get_decks']['input'], decks_dtos['get_decks']['output']>
{
  constructor(
    private readonly decks_repository: DecksRepository,
    private readonly history_repository: HistoryRepository,
    private readonly cards_repository: CardsRepository,
  ) {}

  /**
   * Fetch all decks owned by the user (excluding soft-deleted ones)
   */
  private async fetch_owned_decks(params: {
    user_id: string;
  }): Promise<DecksEntity[]> {
    return this.decks_repository.find_all({
      where: { user_id: params.user_id, deleted_at: null },
    });
  }

  /**
   * Fetch all history entries for the user
   */
  private async fetch_user_history(params: {
    user_id: string;
  }): Promise<HistoryEntity[]> {
    return this.history_repository.find_all({
      where: { user_id: params.user_id },
    });
  }

  /**
   * Fetch decks referenced by the user's history
   */
  private async fetch_history_decks(params: {
    deck_ids: string[];
  }): Promise<DecksEntity[]> {
    if (!params.deck_ids.length) return [];
    return this.decks_repository.find_all({ where: { id: params.deck_ids } });
  }

  /**
   * Merge owned decks and decks from history, de-duplicated by id
   */
  private merge_owned_and_history_decks(params: {
    owned_decks: DecksEntity[];
    other_decks: DecksEntity[];
  }): DecksEntity[] {
    const merged_by_id = new Map<string, DecksEntity>();
    [...params.owned_decks, ...params.other_decks].forEach((deck) => {
      merged_by_id.set(deck.id, deck);
    });
    return Array.from(merged_by_id.values());
  }

  /**
   * Precompute history summaries by deck to avoid querying in the loop
   * - total: number of history entries (cards the user has seen in the deck)
   * - due: number of entries due for review as of now
   */
  private compute_history_summary_by_deck(params: {
    user_history: HistoryEntity[];
  }): Map<string, { total: number; due: number; not_due: number }> {
    const { user_history } = params;

    const now = new Date();

    const summary = new Map<
      string,
      { total: number; due: number; not_due: number }
    >();

    for (const history of user_history) {
      const current = summary.get(history.deck_id) || {
        total: 0,
        due: 0,
        not_due: 0,
      };

      current.total += 1;

      if (history.next_due_at <= now) current.due += 1;
      else current.not_due += 1;

      summary.set(history.deck_id, current);
    }

    return summary;
  }

  /**
   * Enrich each deck with stats by combining card counts and history summary
   */
  private async enrich_with_stats(params: {
    decks: DecksEntity[];
    history_summary_by_deck: Map<
      string,
      { total: number; due: number; not_due: number }
    >;
  }): Promise<DecksEntityWithStats[]> {
    const { decks, history_summary_by_deck } = params;
    const results: DecksEntityWithStats[] = [];
    for (const deck of decks) {
      const number_of_cards = await this.cards_repository.count({
        where: { deck_id: deck.id },
      });

      const history_summary = history_summary_by_deck.get(deck.id) || {
        total: 0,
        due: 0,
        not_due: 0,
      };

      results.push({
        ...deck,
        number_of_cards,
        number_of_cards_ready_to_be_reviewed: history_summary.due,
        number_of_cards_not_ready_to_be_reviewed: history_summary.not_due,
        number_of_users_who_use_the_deck: 0,
      });
    }
    return results;
  }

  async execute(
    params: decks_dtos['get_decks']['input'],
  ): Promise<decks_dtos['get_decks']['output']> {
    const decks_owned_by_user = await this.fetch_owned_decks({
      user_id: params.user_id,
    });

    const user_history = await this.fetch_user_history({
      user_id: params.user_id,
    });

    const decks_user_does_not_own = await this.fetch_history_decks({
      deck_ids: user_history.map((h) => h.deck_id),
    });

    const merged = this.merge_owned_and_history_decks({
      owned_decks: decks_owned_by_user,
      other_decks: decks_user_does_not_own,
    });

    const history_summary_by_deck = this.compute_history_summary_by_deck({
      user_history,
    });

    const enriched = await this.enrich_with_stats({
      decks: merged,
      history_summary_by_deck,
    });

    return enriched;
  }
}
