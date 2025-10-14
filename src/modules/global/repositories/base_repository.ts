export interface BaseEntity {
  id: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface FindAllParams<T extends BaseEntity> {
  where?: {
    [key in keyof T]?: string | string[] | number | number[] | null;
  };
  order?: [keyof T, 'ASC' | 'DESC'];
  take?: number;
  skip?: number;
}

export abstract class BaseRepository<T extends BaseEntity> {
  abstract find_by_id(id: string): Promise<T | null>;
  abstract save(entity: T): Promise<T>;
  abstract find_all(params?: FindAllParams<T>): Promise<T[]>;
  abstract count(params?: FindAllParams<T>): Promise<number>;
  abstract delete(id: string): Promise<void>;
}
