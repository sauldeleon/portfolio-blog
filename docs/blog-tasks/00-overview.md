# [EPIC] Blog CMS — Feature Overview

## Architecture

```
Next.js App Router (existing)
├── app/
│   ├── [lng]/blog/                       # Public blog pages
│   │   ├── page.next.tsx                 # Listing
│   │   ├── [id]/page.next.tsx            # Slug redirect → /[lng]/blog/[id]/[locale-slug]
│   │   └── [id]/[slug]/page.next.tsx     # Post detail
│   ├── blog/preview/[token]/             # Draft preview (no [lng])
│   ├── og/route.tsx                      # Dynamic OG image
│   ├── feed.xml/route.ts                 # RSS feed (EN)
│   ├── feed.es.xml/route.ts              # RSS feed (ES)
│   ├── admin/                            # CMS (outside [lng])
│   │   ├── login/page.next.tsx
│   │   ├── posts/page.next.tsx
│   │   ├── posts/new/page.next.tsx
│   │   ├── posts/[id]/page.next.tsx
│   │   ├── categories/page.next.tsx
│   │   └── images/page.next.tsx
│   └── api/
│       ├── posts/route.ts                    # GET?lng= (public), POST (admin)
│       ├── posts/[id]/route.ts               # GET?lng= (public), PUT/DELETE (admin)
│       ├── posts/[id]/related/route.ts       # GET?lng= (public)
│       ├── posts/[id]/restore/route.ts       # PUT (admin)
│       ├── categories/route.ts               # GET (public), POST (admin)
│       ├── categories/[slug]/route.ts        # PUT/DELETE (admin)
│       ├── tags/route.ts                     # GET (public) — derived from posts.tags array
│       ├── series/[seriesId]/route.ts        # GET?lng= (public)
│       ├── images/route.ts                   # GET (admin)
│       ├── images/[publicId]/route.ts        # DELETE (admin)
│       ├── upload/route.ts                   # POST (admin)
│       ├── preview-mdx/route.ts              # POST (admin)
│       ├── cron/publish/route.ts             # GET (cron, CRON_SECRET)
│       └── auth/[...nextauth]/route.ts       # next-auth
├── middleware.ts                          # Auth guard + rate limiting
└── lib/
    ├── db/
    │   ├── index.ts                      # Drizzle client
    │   ├── schema.ts                     # posts + post_translations + categories tables
    │   └── queries/
    │       ├── posts.ts                  # post CRUD helpers (locale-aware)
    │       ├── categories.ts             # category CRUD helpers
    │       └── tags.ts                   # tag helpers (unnest-based, no table)
    ├── auth/                             # next-auth config
    ├── cloudinary/                       # Upload helpers (folder: sawl.dev - blog)
    ├── mdx/                              # MDX render pipeline
    ├── rss/                              # RSS generator (per locale)
    ├── seo/                              # JSON-LD generators
    └── utils/                            # readingTime, slugify, etc.
```

## Translation Model

Each post has one row in `posts` (locale-agnostic metadata) and one row in `post_translations` per locale:

```
posts.id = "01HX..."
  ├── post_translations (locale='en', slug='adventure-time',      title='Adventure Time')
  └── post_translations (locale='es', slug='tiempo-de-aventuras', title='Tiempo de Aventuras')

/en/blog/01HX.../adventure-time       ← EN URL
/es/blog/01HX.../tiempo-de-aventuras  ← ES URL
/en/blog/01HX.../                     → 301 → /en/blog/01HX.../adventure-time
/es/blog/01HX.../                     → 301 → /es/blog/01HX.../tiempo-de-aventuras
```

- `id` is stable — used for DB lookup and URL
- `slug` is locale-specific — different per language
- Both translations required before publish
- Slug unique per locale — `(locale, slug)` compound unique constraint

## Tech Stack

| Concern             | Choice                                                                                   |
| ------------------- | ---------------------------------------------------------------------------------------- |
| Database            | Vercel Postgres (Neon)                                                                   |
| ORM                 | Drizzle ORM                                                                              |
| Auth                | next-auth v5 Credentials                                                                 |
| Images              | Cloudinary (`sawl.dev - blog` folder) + `next-cloudinary`                                |
| MDX                 | `next-mdx-remote` (DB-stored content)                                                    |
| Editor              | `@uiw/react-md-editor` (SSR-safe via dynamic import)                                     |
| Syntax highlight    | `rehype-pretty-code` + `shiki`                                                           |
| Rate limiting       | `@upstash/ratelimit` + Upstash Redis                                                     |
| i18n (post content) | `post_translations` table — EN + ES per post, locale-specific title/slug/excerpt/content |

---

## Issue Creation Order + Dependency Map

Create GitHub issues in this order. Each issue lists what it **blocks** (cannot start until this is done).

| #   | File                                             | Title                                                    | Depends on       | Blocks           |
| --- | ------------------------------------------------ | -------------------------------------------------------- | ---------------- | ---------------- |
| 1   | `01-database-schema.md`                          | DB: Setup Vercel Postgres + Post Data Model              | —                | **everything**   |
| 2   | `02-api-public-read.md`                          | API: Public Read Endpoints                               | #1               | #5, #6           |
| 3   | `03-auth-admin-api.md`                           | Auth: next-auth + Admin Write Endpoints + Middleware     | #1               | #4, #10, #11     |
| 4   | `04-cloudinary-upload.md`                        | Storage: Cloudinary Image Upload                         | #3               | #5, #6, #11, #12 |
| 5   | `05-blog-listing-page.md`                        | Page: Blog Listing `/[lng]/blog`                         | #2, #4           | #7               |
| 6   | `06-blog-post-detail-page.md`                    | Page: Blog Post Detail `/[lng]/blog/[id]/[slug]`         | #2, #4           | #7, #8, #9       |
| 7   | `07-seo-meta-sitemap.md`                         | SEO: Per-Post Meta, OG, Sitemap, Canonical               | #5, #6           | #13, #14         |
| 8   | `08-syntax-highlight-toc-copy.md`                | UX: Syntax Highlighting + TOC + Copy-to-Clipboard        | #6               | —                |
| 9   | `09-reading-time-related-posts-draft-preview.md` | UX: Reading Time + Related Posts + Draft Preview         | #5, #6           | —                |
| 10  | `10-admin-login-post-list.md`                    | Admin: Login Page + Post List                            | #3               | #11              |
| 11  | `11-admin-post-editor.md`                        | Admin: Post Editor (MDX + Image + Publish)               | #4, #10, #18     | #12              |
| 12  | `12-admin-image-manager.md`                      | Admin: Image Manager                                     | #4, #11          | —                |
| 13  | `13-rss-feed-json-ld.md`                         | SEO: RSS Feed + JSON-LD Article Schema                   | #7               | —                |
| 14  | `14-og-image-generation.md`                      | SEO: Dynamic OG Image Generation                         | #7               | —                |
| 15  | `15-series-scheduled-publish-soft-delete.md`     | Content: Series + Scheduled Publish + Soft Delete + Slug | #3, #11          | —                |
| 16  | `16-isr-rate-limiting.md`                        | Infra: ISR Revalidation + Auth Rate Limiting             | #3, #5, #6       | —                |
| 17  | `17-e2e-tests.md`                                | Testing: Cypress E2E Flows                               | all of the above | —                |
| 18  | `18-admin-categories.md`                         | Admin: Category Management                               | #3, #10          | #11              |

---

## Dependency Graph (visual)

```
#1 DB Schema
├── #2 Public API Read ──────────────────────────┐
│                                                 │
└── #3 Auth + Write API                          │
    └── #4 Cloudinary Upload ────────────────────┤
                                                  │
    ┌─────────────────────────────────────────────┤
    ▼                                             ▼
#5 Listing Page ──┐                    #6 Post Detail Page ──┐
                  │                                           │
                  └───► #7 SEO Meta + Sitemap ◄──────────────┘
                             ├── #13 RSS + JSON-LD
                             └── #14 OG Image Gen

#6 Post Detail ──► #8 Syntax Highlight + TOC + Copy
#5 + #6 ─────────► #9 Reading Time + Related Posts + Preview

#3 Auth ──► #10 Admin Login + Post List
                ├── #18 Admin Categories ──► #11 Admin Post Editor ──► #12 Image Manager
                └──────────────────────────────┘  (also needs #4 Cloudinary)

#3 + #11 ──► #15 Series + Scheduled Publish + Soft Delete
#3 + #5 + #6 ► #16 ISR + Rate Limiting

All ──────────► #17 E2E Tests
```

---

## Milestones

| Milestone            | Issues             |
| -------------------- | ------------------ |
| **Foundation**       | #1, #2, #3, #4     |
| **Public Pages**     | #5, #6             |
| **SEO**              | #7, #13, #14       |
| **UX**               | #8, #9             |
| **Admin CMS**        | #10, #18, #11, #12 |
| **Content Features** | #15                |
| **Infra**            | #16                |
| **Testing**          | #17                |

## Labels to Create in GitHub

- `blog` — all issues in this epic
- `api` — API route work
- `cms` — admin CMS work
- `seo` — SEO/discovery
- `ux` — UX enhancements
- `infra` — infra/DX
- `testing` — test coverage
