# [Auth] next-auth Credentials + Admin Write Endpoints + Middleware

**Labels:** `blog`, `api`, `infra`  
**Milestone:** Foundation  
**Depends on:** #01 (DB schema)  
**Blocks:** #04 (Cloudinary), #10 (admin login/list), #11 (post editor)

## Context

Single-admin blog. No user DB needed. Credentials stored in env vars. next-auth v5 Credentials provider. Middleware guards `/admin/*` and write API routes.

## Auth Setup

### Endpoints

| Method | Route                     | Description                                              |
| ------ | ------------------------- | -------------------------------------------------------- |
| POST   | `/api/auth/[...nextauth]` | next-auth handler (login/logout/session)                 |
| GET    | `/api/auth/me`            | session check — returns `{ authenticated: true }` or 401 |

### Env vars needed

```
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=<bcrypt hash>
NEXTAUTH_SECRET=<random 32-char string>
NEXTAUTH_URL=http://localhost:4200   # dev only — production uses live URL
```

### Vercel env var setup (do before deploying)

- [ ] Generate `NEXTAUTH_SECRET`: `openssl rand -hex 32`
- [ ] Add to Vercel Dashboard → project → **Settings** → **Environment Variables**:
  - `NEXTAUTH_SECRET` — same generated value for all environments
  - `NEXTAUTH_URL` — set to `https://sauldeleon.com` for **Production**, `https://<preview-url>` for **Preview**, `http://localhost:4200` for **Development**
  - `ADMIN_USERNAME` — your admin username
  - `ADMIN_PASSWORD_HASH` — bcrypt hash from `yarn tsx scripts/hash-password.ts`
- [ ] Pull to local: `vercel env pull .env.local`
- [ ] Add keys (no values) to `.env.local.example`

## Admin Write Endpoints — Posts

All post write endpoints manage both the `posts` row and its `post_translations` rows.

### `POST /api/posts`

Create post. Body:

```ts
{
  // post metadata (locale-agnostic):
  category: string
  tags: string[]
  author: string
  coverImage?: string
  seriesId?: string
  seriesOrder?: number
  scheduledAt?: string
  // translations (both required before publish, either may be partial for draft):
  translations: {
    en: { title: string; slug: string; excerpt: string; content: string }
    es: { title: string; slug: string; excerpt: string; content: string }
  }
}
```

- Validates `category` slug exists in `categories` table — return 422 if unknown
- Validates slug uniqueness per locale — return 409 if `(locale, slug)` already taken
- Auto-generates: `id` (ULID), `previewToken` (UUID), `createdAt`, `updatedAt`
- Inserts `posts` row + both `post_translations` rows atomically
- Enforces both translations present before `status = 'published'` — return 422 if publishing with missing translation

### `PUT /api/posts/[id]`

Update post. Body: partial — any combination of metadata and/or translations.

```ts
{
  // optional metadata:
  category?: string
  tags?: string[]
  status?: 'draft' | 'published' | 'archived'
  coverImage?: string
  scheduledAt?: string
  // optional per-locale translation updates:
  translations?: {
    en?: { title?: string; slug?: string; excerpt?: string; content?: string }
    es?: { title?: string; slug?: string; excerpt?: string; content?: string }
  }
}
```

- Validates `category` slug if provided
- Auto-updates `updatedAt`
- Validates slug uniqueness per locale (exclude self from check)
- If `status = 'published'` → verify both translations exist — 422 if missing
- If `publishedAt` set for first time and `scheduledAt` is null → set `status = published`

### `DELETE /api/posts/[id]`

Soft delete — sets `deletedAt = now()` AND `status = 'archived'`. Returns 204. Never hard-deletes.

## Admin Write Endpoints — Categories

Categories are admin-managed only. Tags have no write API (derived from post content).

### `POST /api/categories`

Create category. Body: `{ slug, name, description? }`.

- Validate slug is unique, URL-safe format (`/^[a-z0-9-]+$/`)
- Return 409 if slug already exists

### `PUT /api/categories/[slug]`

Update category. Body: `{ name?, description? }`.

- Slug is immutable (it's the PK and FK in posts) — reject slug changes with 400
- Return 404 if not found

### `DELETE /api/categories/[slug]`

Hard delete.

- Check no published posts reference this category — return 409 with count if blocked
- Allow delete if only draft/archived posts reference it (or zero posts)

## Middleware

`middleware.ts` — protect:

- All `/admin/*` → redirect to `/admin/login` if no session
- `POST/PUT/DELETE /api/posts*` → 401 if no session
- `POST/PUT/DELETE /api/categories*` → 401 if no session
- `POST /api/upload` → 401 if no session

## Tasks

- [ ] Install: `next-auth@beta`, `bcryptjs`
- [ ] Create `lib/auth/config.ts` — next-auth config with Credentials provider
- [ ] Hash comparison: `bcryptjs.compare(password, process.env.ADMIN_PASSWORD_HASH)`
- [ ] Create `app/api/auth/[...nextauth]/route.ts`
- [ ] Create `app/api/auth/me/route.ts`
- [ ] Create `app/api/posts/route.ts` — POST handler (creates post + both translations atomically)
- [ ] Create `app/api/posts/[id]/route.ts` — PUT + DELETE handlers
- [ ] Create `app/api/categories/route.ts` — POST handler
- [ ] Create `app/api/categories/[slug]/route.ts` — PUT + DELETE handlers
- [ ] Create/update `middleware.ts` with auth guard matcher (include categories write routes)
- [ ] Add `scripts/hash-password.ts` — helper to generate bcrypt hash for env setup
- [ ] Document env var setup in `.env.local.example`
- [ ] Validate all request bodies with zod schemas
- [ ] Per-locale slug uniqueness
- [ ] Create `lib/auth/config.spec.ts` — test credentials validation, bcrypt compare
- [ ] Create `app/api/auth/me/route.spec.ts` — test 200 with session, 401 without
- [ ] Create `app/api/posts/route.spec.ts` — test POST (auth, validation, translation insert)
- [ ] Create `app/api/posts/[id]/route.spec.ts` — test PUT/DELETE (auth, soft delete)
- [ ] Create `app/api/categories/route.spec.ts` — test POST (auth, slug validation, 409)
- [ ] Create `app/api/categories/[slug]/route.spec.ts` — test PUT (slug immutable), DELETE (FK check)
- [ ] Create `middleware.spec.ts` — test auth guard for all protected routes: `(locale, slug)` unique constraint enforced at API layer (DB constraint exists but surface 409 with clear message)

## Acceptance Criteria

- [ ] `POST /api/posts` with unknown category slug → 422
- [ ] `POST /api/posts` with duplicate slug in either locale → 409
- [ ] `POST /api/posts` with `status: 'published'` and missing ES translation → 422
- [ ] `POST /api/categories` creates category, returns 201
- [ ] `PUT /api/categories/:slug` with `slug` in body → 400
- [ ] `DELETE /api/categories/:slug` with referenced published posts → 409
- [ ] `DELETE /api/categories/:slug` with no posts → 204
- [ ] All write endpoints return 401 without session
- [ ] `POST /api/posts` with valid session + valid category + both translations → creates post
- [ ] `DELETE /api/posts/:id` sets `deletedAt`, does not hard-delete
- [ ] 100% test coverage on all handlers + middleware

## Notes

- Use `bcryptjs` not native `bcrypt` — edge-compatible
- Session stored in encrypted JWT cookie — no DB adapter needed
- `/admin/login` exempt from middleware guard
- Category slug immutability keeps FK integrity simple (no cascade rename needed)
- Translation atomicity: use a DB transaction for `POST /api/posts` — insert `posts` row + both `post_translations` rows in one transaction. Roll back everything on failure.
