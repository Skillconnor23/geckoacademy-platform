import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import dotenv from 'dotenv';

dotenv.config();

const postgresUrl = process.env.POSTGRES_URL ?? 'postgres://postgres:postgres@127.0.0.1:5432/postgres';
if (!process.env.POSTGRES_URL) {
  console.warn('POSTGRES_URL environment variable is not set; using local fallback URL for module initialization.');
}

export const client = postgres(postgresUrl);
export const db = drizzle(client, { schema });
