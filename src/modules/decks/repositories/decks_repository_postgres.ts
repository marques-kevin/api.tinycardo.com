import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepositoryTypeorm } from '@/modules/global/repositories/base_repository_typeorm';
import { DecksEntity } from '@/modules/decks/entities/decks_entity';
import { DecksRepository } from '@/modules/decks/repositories/decks_repository';

@Injectable()
export class DecksRepositoryPostgres
  extends BaseRepositoryTypeorm<DecksEntity>
  implements DecksRepository
{
  constructor(
    @InjectRepository(DecksEntity)
    protected readonly repository: Repository<DecksEntity>,
  ) {
    super();
  }

  async search(
    params: Parameters<DecksRepository['search']>[0],
  ): ReturnType<DecksRepository['search']> {
    const {
      limit,
      page,
      exclude_user_id,
      front_language,
      back_language,
      title,
    } = params;

    const qb = this.repository
      .createQueryBuilder('d')
      .where('d.deleted_at IS NULL')
      .andWhere('d.visibility = :visibility', { visibility: 'public' })
      .andWhere('d.user_id != :exclude_user_id', { exclude_user_id })
      .orderBy('d.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (front_language) {
      qb.andWhere('d.front_language = :front_language', { front_language });
    }

    if (back_language) {
      qb.andWhere('d.back_language = :back_language', { back_language });
    }

    if (title) {
      qb.andWhere('LOWER(d.name) LIKE :title', {
        title: `%${title.toLowerCase()}%`,
      });
    }

    const [decks, total] = await qb.getManyAndCount();

    return { decks, total };
  }

  async refresh_decks_stats(): ReturnType<
    DecksRepository['refresh_decks_stats']
  > {
    await this.repository.query('REFRESH MATERIALIZED VIEW decks_stats');
  }

  async get_decks_stats(
    params: Parameters<DecksRepository['get_decks_stats']>[0],
  ): ReturnType<DecksRepository['get_decks_stats']> {
    if (!params.deck_ids || params.deck_ids.length === 0) {
      return [];
    }

    const rows = await this.repository.query(
      `
        SELECT deck_id, user_count, card_count
        FROM decks_stats
        WHERE deck_id = ANY($1::varchar[])
      `,
      [params.deck_ids],
    );

    const rows_parsed: {
      deck_id: string;
      user_count: number;
      card_count: number;
    }[] = rows.map(
      (row: { deck_id: string; user_count: number; card_count: number }) => ({
        deck_id: row.deck_id,
        user_count: Number(row.user_count),
        card_count: Number(row.card_count),
      }),
    );

    return rows_parsed;
  }
}
