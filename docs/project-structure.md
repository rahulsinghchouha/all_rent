# Project Structure

> **Rents** — A Next.js 16 property-rental platform  
> Stack: Next.js · TypeScript · Drizzle ORM · PostgreSQL · Zod · Argon2 · Tailwind CSS · Redux Toolkit

---

## Root Layout

```
rents/
├── app/                    # Next.js App Router — all application code lives here
├── docs/                   # Project documentation (you are here)
├── public/                 # Static assets served at /
├── .env.local              # Environment variables (not committed)
├── next.config.ts          # Next.js configuration
├── tsconfig.json           # TypeScript configuration
├── postcss.config.mjs      # PostCSS / Tailwind setup
├── eslint.config.mjs       # ESLint flat-config
└── package.json            # Scripts & dependencies
```

---

## `app/` Directory Tree

```
app/
├── (auth)/                 # Route group: authentication pages (no shared layout with public)
│   ├── layout.tsx          # Auth layout wrapper
│   ├── login/              # /login page
│   └── sign-up/            # /sign-up page
│
├── (public)/               # Route group: public-facing pages
│   ├── layout.tsx          # Public layout wrapper
│   ├── page.tsx            # Splash / landing page  →  /
│   └── about/              # /about page
│
├── api/                    # Next.js Route Handlers (REST-style endpoints)
│   └── auth/
│       ├── login/          # POST /api/auth/login
│       └── sign-up/        # POST /api/auth/sign-up
│
├── config/                 # App-wide static configuration
│   ├── env.ts              # Type-safe environment variable access
│   ├── seo.ts              # Default SEO / Open-Graph metadata
│   └── site.ts             # Site name, description, base URL
│
├── constants/              # Shared constants (no business logic)
│   ├── config.ts           # Feature flags, numeric limits, etc.
│   ├── roles.ts            # User role enum / constants
│   └── routes.ts           # Typed client-side route paths
│
├── dashboard/              # Protected dashboard pages
│
├── hooks/                  # Custom React hooks
│   ├── useAuth.ts          # Reads current auth state from store
│   ├── useDebounce.ts      # Generic debounce hook
│   └── usePagination.ts    # Pagination state & helpers
│
├── lib/                    # Pure server-side utility modules
│   ├── auth.ts             # JWT helpers / session utilities
│   ├── db.ts               # (reserved) secondary DB utility
│   ├── fetcher.ts          # Typed fetch wrapper for server components
│   ├── logger.ts           # ✅ Structured logger — see logger.md
│   └── validations.ts      # Shared Zod schema helpers
│
├── services/               # Business-logic layer (called by API routes)
│   └── auth.ts             # createUserService, loginService, etc.
│
├── store/                  # Redux Toolkit global state
│   ├── store.ts            # configureStore — combines all slices
│   ├── hooks.ts            # Typed useAppDispatch & useAppSelector
│   ├── provider.tsx        # ReduxProvider client component
│   ├── listingSlice.ts     # Listing create/edit slice (draft, stepper)
│   ├── auth.store.ts       # (reserved) Auth slice
│   └── ui.store.ts         # (reserved) UI slice (modals, sidebar, theme)
│
├── tables/                 # Drizzle ORM table definitions
│   └── usersTable.ts       # `users` table schema
│
├── tablesValidation/       # Zod schemas generated from Drizzle tables
│   └── userValidation.ts   # insertUserSchema, selectUserSchema, signUpSchema
│
├── types/                  # Shared TypeScript types & interfaces
│   ├── api.types.ts        # Request / Response type contracts
│   └── index.d.ts          # Global ambient type augmentations
│
├── utils/                  # General-purpose utilities
│   ├── dbConnect.ts        # Drizzle + postgres.js database client
│   └── helper.ts           # Miscellaneous helper functions
│
├── error.tsx               # Global error boundary (App Router)
├── layout.tsx              # Root HTML shell & font loading
├── loading.tsx             # Global loading skeleton
├── middleware.ts           # Next.js edge middleware (auth guards, redirects)
├── not-found.tsx           # Custom 404 page
├── globals.css             # Tailwind base + custom CSS variables
└── favicon.ico
```

---

## Key Directory Responsibilities

| Directory | Responsibility |
|-----------|---------------|
| `(auth)/` | Authentication UX — login, registration |
| `(public)/` | Marketing & informational pages |
| `api/` | HTTP route handlers; thin layer — delegates to `services/` |
| `config/` | Single source of truth for all static settings |
| `constants/` | Magic-number-free named constants |
| `hooks/` | Reusable stateful logic for client components |
| `lib/` | Standalone server utilities (no React imports) |
| `services/` | All business logic; tested independently of HTTP layer |
| `store/` | Client-side global state via Redux Toolkit |
| `tables/` | Database schema definitions (Drizzle) |
| `tablesValidation/` | Input validation schemas (Drizzle-Zod + hand-crafted Zod) |
| `types/` | Shared TypeScript contracts |
| `utils/` | Generic helpers & the singleton DB connection |

---

## Data Flow (Sign-Up Example)

```
Browser (sign-up form)
    │
    │ POST /api/auth/sign-up
    ▼
app/api/auth/sign-up/route.ts          ← validates body with signUpSchema (Zod)
    │                                  ← applies in-memory rate limiting
    │ calls
    ▼
app/services/auth.ts                   ← hashes password with Argon2id
    │                                  ← inserts row via Drizzle ORM
    │ uses
    ▼
app/utils/dbConnect.ts                 ← postgres.js → PostgreSQL
```

---

## Naming Conventions

| Pattern | Example |
|---------|---------|
| Route files | `route.ts` (API), `page.tsx` (UI) |
| Store files | `<domain>Slice.ts` |
| Table files | `<entity>Table.ts` |
| Validation files | `<entity>Validation.ts` (All Zod schemas: e.g., login, signup) |
| Hook files | `use<Name>.ts` |
| Service files | `<domain>.ts` inside `services/` |

---

## Related Documentation

- [Logger](./logger.md) — structured logging guide
- [API Routes](./api-routes.md) — endpoint reference
- [Database](./database.md) — schema & ORM usage
