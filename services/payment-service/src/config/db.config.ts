import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { config } from './app.config';
import * as schema from '../db/schema';

const client = postgres(config.DATABASE_URL, {
  ssl: 'require',
  max: 20,
  idle_timeout: 30,
  connect_timeout: 10,
  prepare: false, 
});

export const db = drizzle(client, { schema });

export { client };
