import { type HistoryEntity } from '@/modules/history/entities/history_entity';

export const BASE_EASE_FACTOR = 2.5;
export const MIN_EASE_FACTOR = 1.3;
export const MAX_EASE_FACTOR = 3.0;

export function history_due_date_algorithm<T extends HistoryEntity>(params: {
  history: T;
  status: 'known' | 'unknown';
}): T {
  const { history, status } = params;
  const now = new Date();

  let { repetition_count, ease_factor } = history;
  let next_due_at = history.next_due_at;

  if (status === 'unknown') {
    /**
     * Reset streak
     */
    repetition_count = 0;

    /**
     * Decrease ease factor, clamp to minimum 1.3
     */
    ease_factor = Math.max(MIN_EASE_FACTOR, ease_factor - 0.2);

    /**
     * Schedule for immediate review (today)
     */
    next_due_at = now;
  } else if (status === 'known') {
    repetition_count += 1;

    // Update ease factor slightly upward, clamp to ~3.0
    ease_factor = Math.min(MAX_EASE_FACTOR, ease_factor + 0.1);

    let interval_days: number;
    if (repetition_count === 1) {
      interval_days = 1; // first success: 1 day
    } else if (repetition_count === 2) {
      interval_days = 6; // second success: 6 days
    } else {
      // After that, interval grows by ease factor
      const prev_interval_days =
        (history.next_due_at.getTime() - history.last_reviewed_at.getTime()) /
        (1000 * 60 * 60 * 24);

      interval_days = Math.round(prev_interval_days * ease_factor);
    }

    next_due_at = new Date(now.getTime() + interval_days * 24 * 60 * 60 * 1000);
  }

  return {
    ...history,
    repetition_count,
    ease_factor,
    next_due_at,
    last_reviewed_at: now,
  };
}
