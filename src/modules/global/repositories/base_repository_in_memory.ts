import {
  BaseEntity,
  BaseRepository,
  FindAllParams,
} from '@/modules/global/repositories/base_repository';

export class BaseRepositoryInMemory<
  T extends BaseEntity,
> extends BaseRepository<T> {
  private data: Array<T> = [];

  private sort_data(data: T[], order: [keyof T, 'ASC' | 'DESC']) {
    return data.sort((a, b) => {
      const aValRaw = a[order[0]] as unknown as any;
      const bValRaw = b[order[0]] as unknown as any;

      const aVal =
        aValRaw instanceof Date ? aValRaw.getTime() : Number(aValRaw);
      const bVal =
        bValRaw instanceof Date ? bValRaw.getTime() : Number(bValRaw);

      return order[1] === 'ASC' ? aVal - bVal : bVal - aVal;
    });
  }

  async find_by_id(id: string): Promise<T | null> {
    return this.data.find((item) => item.id === id) || null;
  }

  async save(entity: T): Promise<T> {
    const index = this.data.findIndex((item) => item.id === entity.id);

    if (index !== -1) {
      this.data[index] = entity;
      return entity;
    }

    this.data.push(entity);

    return entity;
  }

  async find_all(params?: FindAllParams<T>): Promise<T[]> {
    if (!params) {
      return this.data;
    }

    let filterd_data = this.data;

    if (params.where) {
      filterd_data = this.data.filter((item) => {
        return Object.entries(params.where!).every(([key, value]) => {
          if (value === undefined) return true;
          if (Array.isArray(value)) {
            return value.includes(item[key as keyof T] as any);
          }
          return item[key as keyof T] === value;
        });
      });
    }

    const sortedData = this.sort_data(
      filterd_data,
      params.order || ['id', 'ASC'],
    );

    const start = params.skip || 0;
    const end =
      params.take !== undefined && params.take !== null
        ? start + params.take
        : undefined;

    return sortedData.slice(start, end);
  }

  async count(params?: FindAllParams<T>): Promise<number> {
    if (!params) {
      return this.data.length;
    }

    const results = await this.find_all(params);
    return results.length;
  }

  async delete(id: string): Promise<void> {
    const index = this.data.findIndex((item) => item.id === id);
    if (index !== -1) {
      this.data.splice(index, 1);
    }
  }

  async exists(id: string): Promise<boolean> {
    return this.data.some((item) => item.id === id);
  }

  // Helper method for testing
  clear(): void {
    this.data = [];
  }
}
