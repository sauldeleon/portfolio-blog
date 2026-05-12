# [Infra] ISR Revalidation + Auth Rate Limiting

**Labels:** `blog`, `infra`  
**Milestone:** Infra  
**Depends on:** #03 (auth), #06 (post detail), #05 (listing)

## Context

Two infra concerns: on-demand ISR to avoid stale post pages after publish/update, and brute-force protection on the login endpoint.

---

## 1. ISR (Incremental Static Regeneration)

### Strategy

- Post pages: `export const revalidate = 60` (background revalidation every 60s)
- On-demand revalidation on publish/update: call `revalidatePath` from write API handlers

### On-demand revalidation

Each post has two locale-specific URLs with different slugs — both must be revalidated. Use tag strategy (recommended) so you don't need to know the slug at revalidation time.

In `PUT /api/posts/[id]` and `POST /api/posts` (on publish):

```ts
import { revalidateTag } from 'next/cache'

// After DB update — invalidates all pages tagged with these keys:
revalidateTag('posts') // listing pages both locales
revalidateTag(`post-${id}`) // detail pages both locales + redirect page
```

If using `revalidatePath` instead (requires fetching both locale slugs first):

```ts
// Fetch translations to get locale-specific slugs
const [en, es] = await Promise.all([getPostById(id, 'en'), getPostById(id, 'es')])
revalidatePath('/en/blog')
revalidatePath('/es/blog')
revalidatePath(`/en/blog/${id}`) // redirect page
revalidatePath(`/es/blog/${id}`) // redirect page
revalidatePath(`/en/blog/${id}/${en.slug}`) // EN detail page
revalidatePath(`/es/blog/${id}/${es.slug}`) // ES detail page
```

Prefer `revalidateTag` — simpler, no slug lookup needed.

### `revalidate` tag strategy

Tag pages at fetch time:

```ts
fetch('/api/posts?lng=en', { next: { tags: ['posts'] } })
fetch(`/api/posts/${id}?lng=en`, { next: { tags: [`post-${id}`] } })
```

Then in write handlers:

```ts
revalidateTag('posts')
revalidateTag(`post-${id}`)
```

### Tasks

- [ ] Add `export const revalidate = 60` to `app/[lng]/blog/page.next.tsx`
- [ ] Add `export const revalidate = 3600` to `app/[lng]/blog/[id]/[slug]/page.next.tsx` (longer — on-demand handles freshness)
- [ ] Add `export const revalidate = 3600` to `app/[lng]/blog/[id]/page.next.tsx` (slug redirect page)
- [ ] Add `revalidateTag('posts')` to `POST /api/posts` (on create/publish)
- [ ] Add `revalidateTag('posts')` + `revalidateTag('post-${id}')` to `PUT /api/posts/[id]`
- [ ] Add `revalidateTag('posts')` + `revalidateTag('post-${id}')` to `DELETE /api/posts/[id]`
- [ ] Tag fetches in listing + detail pages with appropriate cache tags
- [ ] Update cron publish job (#15) to revalidate after auto-publish

---

## 2. Rate Limiting on Auth Endpoint

Prevent brute-force attacks on `POST /api/auth/[...nextauth]` (login endpoint).

### Implementation

Use `@upstash/ratelimit` + `@upstash/redis` (Vercel KV or Upstash free tier).

```ts
// middleware.ts — check rate limit before forwarding to next-auth
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Do NOT use Redis.fromEnv() — Vercel KV uses KV_REST_API_* vars, not UPSTASH_* vars
const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '1m'), // 10 requests per minute per IP
});

// Apply only to POST /api/auth/callback/credentials
const ip = request.ip ?? '127.0.0.1';
const { success } = await ratelimit.limit(ip);
if (!success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
```

### Vercel KV (Upstash Redis) Setup

- [ ] Go to Vercel Dashboard → project → **Storage** tab → **Create Database** → choose **KV** (powered by Upstash)
- [ ] Name it (e.g. `portfolio-blog-kv`), select same region as Postgres
- [ ] Click **Connect** to link to project — Vercel auto-injects env vars
- [ ] Pull env vars: `vercel env pull .env.local`
- [ ] Verify these vars are present in `.env.local`:
  ```
  KV_URL="redis://..."
  KV_REST_API_URL="https://..."
  KV_REST_API_TOKEN="..."
  KV_REST_API_READ_ONLY_TOKEN="..."
  ```
- [ ] `@upstash/redis`'s `Redis.fromEnv()` looks for `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` — map Vercel KV vars in `lib/redis/index.ts`:

  ```ts
  import { Redis } from '@upstash/redis'

  export const redis = new Redis({
    url: process.env.KV_REST_API_URL!,
    token: process.env.KV_REST_API_TOKEN!,
  })
  ```

- [ ] Add `KV_REST_API_URL`, `KV_REST_API_TOKEN` keys (no values) to `.env.local.example`

### Code Tasks

- [ ] Install: `@upstash/ratelimit`, `@upstash/redis`
- [ ] Create `lib/redis/index.ts` — Redis client using KV vars (see above)
- [ ] Add rate limit check in `middleware.ts` for `POST /api/auth/callback/credentials`
- [ ] Return 429 with `Retry-After: 60` header when limit exceeded
- [ ] Login page shows "Too many attempts, try again in 1 minute" error on 429

## Acceptance Criteria

- [ ] Publishing a post → listing page reflects change within ~5s (ISR + on-demand)
- [ ] Deleting a post → removed from listing without manual redeploy
- [ ] `POST /api/auth` 11th request within 1 minute returns 429
- [ ] Login form shows appropriate error on 429
- [ ] 100% test coverage on rate limiting middleware logic
