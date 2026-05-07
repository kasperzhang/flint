import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

let db: ReturnType<typeof drizzle<typeof schema>> | null = null;

if (process.env.DATABASE_URL) {
  try {
    const client = postgres(process.env.DATABASE_URL);
    db = drizzle(client, { schema });
  } catch {
    console.warn("Failed to connect to database — running without persistence");
  }
}

export { db };
export { sessions, messages } from "./schema";
