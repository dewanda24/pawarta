import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../src/db/schema";
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("DATABASE_URL is not set");
    process.exit(1);
  }

  const client = postgres(connectionString);
  const db = drizzle(client, { schema });

  try {
    const allUsers = await db.query.users.findMany();
    console.log("Users in Database:");
    console.log(JSON.stringify(allUsers, null, 2));
  } catch (error) {
    console.error("Error querying users:", error);
  } finally {
    process.exit(0);
  }
}

main();
