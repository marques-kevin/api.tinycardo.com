import 'reflect-metadata';
import { DataSource } from 'typeorm';

export default new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  migrationsRun: false,
  migrations: ['src/migrations/*.{ts,js}'],
  migrationsTableName: 'migrations',
});
