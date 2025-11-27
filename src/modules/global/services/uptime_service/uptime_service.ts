export const UptimeServiceNames = {
  DECKS_REFRESH_MATERIALIZED_VIEW: 'DECKS_REFRESH_MATERIALIZED_VIEW',
} as const;

export abstract class UptimeService {
  abstract ping(params: {
    service_name: (typeof UptimeServiceNames)[keyof typeof UptimeServiceNames];
  }): Promise<void>;
}
