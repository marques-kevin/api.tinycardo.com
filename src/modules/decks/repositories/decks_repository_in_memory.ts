import { BaseRepositoryInMemory } from '@/modules/global/repositories/base_repository_in_memory';
import {
  DecksRepository,
  DecksSearchParams,
  DecksSearchResult,
} from '@/modules/decks/repositories/decks_repository';
import { DecksEntity } from '@/modules/decks/entities/decks_entity';

export class DecksRepositoryInMemory
  extends BaseRepositoryInMemory<DecksEntity>
  implements DecksRepository
{
  async search(params: DecksSearchParams): Promise<DecksSearchResult> {
    const {
      limit,
      page,
      exclude_user_id,
      front_language,
      back_language,
      title,
    } = params;

    let results = await this.find_all({
      where: {
        deleted_at: null as any,
        visibility: 'public' as any,
      },
      order: ['created_at', 'DESC'],
    });

    // Exclude decks owned by the requesting user
    results = results.filter((d) => d.user_id !== exclude_user_id);

    if (front_language) {
      results = results.filter((d) => d.front_language === front_language);
    }

    if (back_language) {
      results = results.filter((d) => d.back_language === back_language);
    }

    if (title) {
      const tl = title.toLowerCase();
      results = results.filter((d) => d.name.toLowerCase().includes(tl));
    }

    const total = results.length;
    const skip = (page - 1) * limit;
    const decks = results.slice(skip, skip + limit);

    return { decks, total };
  }
}
