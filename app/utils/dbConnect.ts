import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const connectionString = process.env.DATABASE_URL!;

const client = postgres(connectionString, {
    max: 20, // connection pool
});

export const db = drizzle(client);