import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is missing in environment variables.');
}

// Gunakan connection pool untuk environment selain edge/serverless
const client = postgres(connectionString, { max: 1 });
export const db = drizzle(client, { schema });
