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

  await sql.unsafe(`
    CREATE TABLE IF NOT EXISTS conversations (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      user_one_id uuid NOT NULL,
      user_two_id uuid NOT NULL,
      created_at timestamp DEFAULT now() NOT NULL,
      updated_at timestamp DEFAULT now() NOT NULL,
      CONSTRAINT conversation_users_unique UNIQUE (user_one_id, user_two_id),
      CONSTRAINT conversations_user_one_id_users_id_fk FOREIGN KEY (user_one_id) REFERENCES public.users(id),
      CONSTRAINT conversations_user_two_id_users_id_fk FOREIGN KEY (user_two_id) REFERENCES public.users(id)
    );

    CREATE TABLE IF NOT EXISTS "message" (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      conversation_id uuid NOT NULL,
      sender_id uuid NOT NULL,
      content text NOT NULL,
      message_type varchar(20) DEFAULT 'TEXT' NOT NULL,
      created_at timestamp DEFAULT now() NOT NULL,
      updated_at timestamp DEFAULT now() NOT NULL,
      CONSTRAINT message_conversation_id_conversations_id_fk FOREIGN KEY (conversation_id) REFERENCES public.conversations(id),
      CONSTRAINT message_sender_id_users_id_fk FOREIGN KEY (sender_id) REFERENCES public.users(id)
    );

    ALTER TABLE public.users
      ADD COLUMN IF NOT EXISTS is_online boolean NOT NULL DEFAULT false,
      ADD COLUMN IF NOT EXISTS is_typing boolean NOT NULL DEFAULT false,
      ADD COLUMN IF NOT EXISTS last_seen_at timestamp;
  `);

  console.log("✅ Migrations complete!");
  await sql.end();
}

runMigrations().catch((err) => {
  console.error("❌ Migration failed:", err);
  process.exit(1);
});
