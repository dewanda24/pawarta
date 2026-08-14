import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../src/db/schema";
import bcrypt from "bcryptjs";
import 'dotenv/config';

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("DATABASE_URL is not set");
    process.exit(1);
  }

  const client = postgres(connectionString);
  const db = drizzle(client, { schema });

  try {
    const passwordHash = await bcrypt.hash('admin123', 10);

    const result = await db.insert(schema.users).values({
      username: 'admin',
      passwordHash: passwordHash,
      nama: 'Administrator',
      email: 'admin@pawarta.local',
      roleId: null, // Assuming nullable, adjust if needed
      status: 'Aktif',
    }).onConflictDoUpdate({
      target: schema.users.username,
      set: {
        passwordHash: passwordHash,
        status: 'Aktif',
      }
    }).returning();

    console.log("Admin user created/updated:");
    console.log(result);
  } catch (error) {
    console.error("Error creating user:", error);
  } finally {
    process.exit(0);
  }
}

main();
