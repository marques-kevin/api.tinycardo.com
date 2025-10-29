import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepositoryTypeorm } from '@/modules/global/repositories/base_repository_typeorm';
import { DecksEntity } from '@/modules/decks/entities/decks_entity';
import {
  DecksRepository,
  DecksSearchParams,
  DecksSearchResult,
} from '@/modules/decks/repositories/decks_repository';

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

  async search(params: DecksSearchParams): Promise<DecksSearchResult> {
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
}
