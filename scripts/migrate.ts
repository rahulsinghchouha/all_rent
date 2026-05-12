// env loaded via --env-file flag in npm script
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set in .env.local");
}

// Strip spaces around '=' if present (e.g. DATABASE_URL = postgresql://...)
const cleanUrl = connectionString.trim();

async function runMigrations() {
  console.log("🔄 Running database migrations...");
  const sql = postgres(cleanUrl, { max: 1 });
  const db = drizzle(sql);

  await migrate(db, { migrationsFolder: "./drizzle/migrations" });

  console.log("✅ Migrations complete!");
  await sql.end();
}

runMigrations().catch((err) => {
  console.error("❌ Migration failed:", err);
  process.exit(1);
});
