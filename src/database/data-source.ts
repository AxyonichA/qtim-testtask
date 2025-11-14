import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

const ENV = process.env.NODE_ENV;
dotenv.config({
  path: !ENV ? '.env' : `.env.${ENV}`,
});
const isTs = __filename.endsWith('.ts');

export default new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT ?? 5432),
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  entities: [isTs ? 'src/**/*.entity.ts' : 'dist/**/*.entity.js'],
  migrations: [isTs ? 'src/database/migrations/*.ts' : 'dist/database/migrations/*.js'],
  namingStrategy: new SnakeNamingStrategy(),
});
