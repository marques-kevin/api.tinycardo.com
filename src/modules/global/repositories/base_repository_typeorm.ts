import { Injectable } from '@nestjs/common';
import {
  FindManyOptions,
  FindOptionsOrder,
  FindOptionsWhere,
  In,
  Repository,
} from 'typeorm';
import {
  BaseEntity,
  BaseRepository,
  FindAllParams,
} from '@/modules/global/repositories/base_repository';

@Injectable()
export class BaseRepositoryTypeorm<
  T extends BaseEntity,
> extends BaseRepository<T> {
  protected readonly repository: Repository<T>;

  async find_by_id(id: string): Promise<T | null> {
    const entity = await this.repository.findOne({
      where: { id } as FindOptionsWhere<T>,
    });
    return entity || null;
  }

  async save(entity: T): Promise<T> {
    return await this.repository.save(entity);
  }

  private params_to_typeorm(params?: FindAllParams<T>): FindManyOptions<T> {
    const typeorm_params: FindManyOptions<T> = {};

    if (!params) return typeorm_params;

    if (params.where) {
      typeorm_params.where = Object.fromEntries(
        Object.entries(params.where).map(([key, value]) => {
          if (Array.isArray(value)) {
            return [key, In(value as string[])];
          }
          return [key, value];
        }),
      ) as FindOptionsWhere<T>;
    }

    if (params.order) {
      typeorm_params.order = {
        [params.order[0]]: params.order[1],
      } as FindOptionsOrder<T>;
    }

    if (params.take) {
      typeorm_params.take = params.take;
    }

    if (params.skip) {
      typeorm_params.skip = params.skip;
    }

    return typeorm_params;
  }

  async find_all(params?: FindAllParams<T>): Promise<T[]> {
    return this.repository.find(this.params_to_typeorm(params));
  }

  async count(params?: FindAllParams<T>): Promise<number> {
    return this.repository.count(this.params_to_typeorm(params));
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
