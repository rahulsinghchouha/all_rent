# Database

> ORM: **Drizzle ORM** · Driver: **postgres.js** · Database: **PostgreSQL**

---

## Connection

**File:** `app/utils/dbConnect.ts`

```ts
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const client = postgres(process.env.DATABASE_URL!, { max: 20 });
export const db = drizzle(client);
```

- Connection string comes from `DATABASE_URL` in `.env.local`
- Pool size capped at **20** concurrent connections

---

## Schema

### `users` Table

**File:** `app/tables/usersTable.ts`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | `uuid` | PK, default random | Auto-generated |
| `user_name` | `varchar(255)` | NOT NULL | Display name |
| `email` | `varchar(255)` | NOT NULL, UNIQUE | Login identifier |
| `phone_number` | `varchar(20)` | nullable | Optional |
| `phone_verified` | `boolean` | default `false` | OTP verified |
| `password_hash` | `varchar` | nullable | Argon2id hash |
| `is_active` | `boolean` | default `true` | Soft-enable flag |
| `created_at` | `timestamp` | NOT NULL | Set on insert |
| `updated_at` | `timestamp` | NOT NULL, default now | Auto-updated |
| `deleted_at` | `timestamp` | nullable | Soft-delete marker |

---

## Validation Schemas

**File:** `app/tablesValidation/userValidation.ts`

| Export | Source | Purpose |
|--------|--------|---------|
| `insertUserSchema` | `createInsertSchema(users)` | Auto-generated insert shape |
| `selectUserSchema` | `createSelectSchema(users)` | Auto-generated select shape |
| `InsertUser` | `z.infer<typeof insertUserSchema>` | TypeScript insert type |
| `SelectUser` | `z.infer<typeof selectUserSchema>` | TypeScript select type |
| `signUpSchema` | Hand-crafted Zod | Stricter sign-up validation |

---

## Password Storage

Passwords are **never** stored in plain text. The `createUserService` hashes them with **Argon2id** before insert:

```ts
const hashedPassword = await argon2.hash(userData.password, {
  type: argon2.argon2id,
  memoryCost: 65536,  // 64 MB
  timeCost: 3,        // iterations
  parallelism: 4,     // threads
});
```

### Why Argon2id?

- Winner of the Password Hashing Competition (2015)
- Resistant to GPU brute-force (memory-hard) and side-channel attacks
- `argon2id` is the recommended hybrid variant

---

## Error Codes

| PostgreSQL Code | Meaning | Handled in |
|-----------------|---------|-----------|
| `23505` | Unique violation (duplicate email) | `services/auth.ts` → throws `"Email already exists"` |
