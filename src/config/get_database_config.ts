import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const get_database_config = (): TypeOrmModuleOptions[] => {
  if (process.env.NODE_ENV === 'test') {
    return [
      {
        name: 'default',
        type: 'postgres',
        migrationsRun: false,
        url: process.env.DATABASE_URL,
      },
    ] as TypeOrmModuleOptions[];
  }

  return [
    {
      name: 'default',
      type: 'postgres',
      migrationsRun: false,
      url: process.env.DATABASE_URL,
    },
  ] as TypeOrmModuleOptions[];
};
