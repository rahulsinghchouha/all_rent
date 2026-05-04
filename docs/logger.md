# Logger

> **File:** `app/lib/logger.ts`  
> A lightweight, zero-dependency structured logger built for the Rents Next.js application.

---

## Overview

The logger replaces scattered `console.log` / `console.error` calls with a single, consistent interface that:

- **Applies log levels** — only emit messages at or above the configured minimum level
- **Auto-detects the environment** — coloured dev output vs. newline-delimited JSON in production
- **Attaches structured metadata** — pass any extra key/value pairs as a second argument
- **Writes errors to `stderr`** — keeping error messages separate from normal output streams

---

## Log Levels

| Level | Priority | When to use |
|-------|----------|-------------|
| `debug` | 0 | Verbose diagnostic details (dev only by default) |
| `info`  | 1 | Normal operation milestones |
| `warn`  | 2 | Unexpected but recoverable situations |
| `error` | 3 | Failures that need attention |

> In **production** (`NODE_ENV=production`) only `warn` and `error` are emitted.  
> In **development** all four levels are emitted.

---

## Import

```ts
import { logger } from "@/app/lib/logger";
```

---

## API

### `logger.debug(message, meta?)`

```ts
logger.debug("Parsing request body", { route: "/api/auth/sign-up" });
```

### `logger.info(message, meta?)`

```ts
logger.info("User created successfully", { userId: newUser.id, email: newUser.email });
```

### `logger.warn(message, meta?)`

```ts
logger.warn("Rate limit nearly reached", { ip, count: rateData.count });
```

### `logger.error(message, meta?)`

```ts
logger.error("Database insert failed", { error: err.message, code: err.code });
```

---

## Output Formats

### Development — coloured, human-readable

```
2026-05-05T00:06:59.000Z [INFO] User created successfully
  {
    "userId": "a1b2-...",
    "email": "user@example.com"
  }
```

### Production — newline-delimited JSON (stdout / stderr)

```json
{"level":"info","message":"User created successfully","timestamp":"2026-05-05T00:06:59.000Z","meta":{"userId":"a1b2-...","email":"user@example.com"}}
```

---

## Integration Examples

### API Route handler (`app/api/auth/sign-up/route.ts`)

```ts
import { logger } from "@/app/lib/logger";

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown-ip";

  try {
    // ✅ Replace console.log
    logger.debug("Sign-up request received", { ip });

    const body = await req.json();
    const parsedBody = signUpSchema.safeParse(body);

    if (!parsedBody.success) {
      // ✅ Replace console.error
      logger.warn("Validation failed on sign-up", {
        errors: parsedBody.error.format(),
        ip,
      });
      return NextResponse.json({ error: "Validation failed" }, { status: 400 });
    }

    const newUser = await createUserService({ ...parsedBody.data });

    logger.info("New user registered", { userId: newUser.id });

    return NextResponse.json({ message: "User created successfully", data: newUser });
  } catch (error: any) {
    logger.error("Sign-up failed", { message: error.message, ip });
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
```

### Service layer (`app/services/auth.ts`)

```ts
import { logger } from "@/app/lib/logger";

export async function createUserService(userData: ...) {
  logger.debug("Hashing password for new user");

  const hashedPassword = await argon2.hash(userData.password, { ... });

  logger.debug("Inserting new user into database", { email: userData.email });

  const [newUser] = await db.insert(users).values({ ... }).returning({ ... });

  logger.info("User insert successful", { userId: newUser.id });

  return newUser;
}
```

---

## Environment Variable Reference

| Variable | Effect |
|----------|--------|
| `NODE_ENV=development` | All levels enabled, coloured output |
| `NODE_ENV=production` | Only `warn` + `error`, JSON output |

> The minimum level can be adjusted at the top of `logger.ts` by changing `MIN_LEVEL`.

---

## Design Decisions

| Decision | Rationale |
|----------|-----------|
| Zero dependencies | Avoids bundle bloat; Next.js edge runtime compatibility |
| JSON in production | Log aggregators (Datadog, CloudWatch, GCP Logging) parse NDJSON natively |
| `stderr` for errors/warnings | Enables log stream separation in containerised deployments |
| Optional `meta` param | Keeps call sites clean when no extra context is needed |
