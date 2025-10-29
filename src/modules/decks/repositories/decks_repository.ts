import { BaseRepository } from '@/modules/global/repositories/base_repository';
import { DecksEntity } from '@/modules/decks/entities/decks_entity';

export type DecksSearchParams = {
  limit: number;
  page: number;
  exclude_user_id: string;
  front_language?: string;
  back_language?: string;
  title?: string;
};

export type DecksSearchResult = {
  decks: DecksEntity[];
  total: number;
};

export abstract class DecksRepository extends BaseRepository<DecksEntity> {
  abstract search(params: DecksSearchParams): Promise<DecksSearchResult>;
}
