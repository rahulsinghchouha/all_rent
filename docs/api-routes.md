# API Routes

> All route handlers live under `app/api/` and follow Next.js App Router conventions.  
> Each handler is a thin HTTP layer — validation lives in `tablesValidation/`, business logic in `services/`.

---

## Base URL

| Environment | Base URL |
|-------------|----------|
| Development | `http://localhost:3000` |
| Production  | TBD |

---

## Authentication Routes — `/api/auth`

### `POST /api/auth/sign-up`

**File:** `app/api/auth/sign-up/route.ts`

Registers a new user account.

#### Request Body

```json
{
  "userName": "Jane Doe",
  "email": "jane@example.com",
  "password": "Secret1@",
  "terms": true
}
```

#### Validation Rules (Zod — `signUpSchema`)

| Field | Rules |
|-------|-------|
| `userName` | string, min 3 chars, max 255 |
| `email` | valid email format |
| `password` | min 8 chars, ≥1 uppercase, ≥1 lowercase, ≥1 digit, ≥1 special char |
| `terms` | must be `true` |

#### Rate Limiting

- **5 requests per IP per hour** (in-memory `Map`, resets after 1 hour)
- Old entries are probabilistically pruned (10 % chance per request) to prevent memory leaks

#### Responses

| Status | Body | When |
|--------|------|------|
| `200` | `{ message, data: { id, userName, email, createdAt } }` | Success |
| `400` | `{ error: "Validation failed", details }` | Invalid body |
| `409` | `{ error: "Email already exists" }` | Duplicate email |
| `429` | `{ error: "Too many sign-up attempts…" }` | Rate limited |
| `500` | `{ error: "Internal Server Error" }` | Unexpected error |

---

### `POST /api/auth/login`

**File:** `app/api/auth/login/route.ts` _(coming soon)_

Authenticates an existing user and returns a JWT.

---
## Products Routes — `/api/products`

### `GET /api/products`

**File:** `app/api/products/route.ts`

Returns a list of products.

#### Query Parameters

- `status` — optional, defaults to `published`
- `ownerId` — optional owner filter
- `category` — optional category filter
- `limit` — optional maximum number of results (default `50`)

#### Responses

| Status | Body | When |
|--------|------|------|
| `200` | `{ data: [ ...products ] }` | Success |
| `400` | `{ error: "Invalid limit" }` | Invalid query param |
| `500` | `{ error: "Failed to fetch products" }` | Server error |

### `POST /api/products`

**File:** `app/api/products/route.ts`

Creates a new product listing.

#### Request Body

The request body must match the product insert schema in `app/tablesValidation/productsValidation.ts`.

#### Responses

| Status | Body | When |
|--------|------|------|
| `201` | `{ data: { ...product } }` | Created successfully |
| `400` | `{ error: "Validation failed: ..." }` | Invalid payload |
| `422` | `{ error: "No product owner configured..." }` | Owner lookup failed |
| `500` | `{ error: "Failed to create product" }` | Server error |

---
## Users Routes — `/api/users`

_(planned)_

---

## Middleware

**File:** `app/middleware.ts`

Currently passes all requests through. Planned usage:

- Verify JWT token from cookie / `Authorization` header
- Redirect unauthenticated users away from dashboard routes
- Attach user context to request headers for downstream handlers

**Matcher pattern** — applies to all routes except:
- `/api/*`
- `/_next/static/*`
- `/_next/image/*`
- `/favicon.ico`
