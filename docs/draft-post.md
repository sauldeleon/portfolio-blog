# Building a REST API with Next.js App Router

![caption=A winding road through a dense forest.&alt=A winding road through a dense forest&expand=true](https://picsum.photos/id/11/2500/1667)

Modern web development has shifted dramatically toward full-stack frameworks. Next.js App Router brings server components, route handlers, and streaming — all in one cohesive model.

## Why App Router Changes Everything

The Pages Router was solid. But it had a fundamental limitation: every component was a client component by default. With App Router, the opposite is true — **components are server-first**, and you opt into client behavior explicitly.

This matters for performance. A server component:

- Never ships JavaScript to the browser
- Can read from databases directly
- Has access to secrets without exposing them
- Streams HTML progressively

> The mental model shift is from "hydrating a client app" to "progressively enhancing a server-rendered page." Once it clicks, you won't go back.

---

## Setting Up Route Handlers

Route handlers live in `app/api/` and replace the old `pages/api/` pattern. The file must be named `route.ts`.

```typescript
// app/api/posts/route.ts
import { db } from '@/lib/db'
import { posts } from '@/lib/db/schema'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') ?? '1', 10)

  const data = await db
    .select()
    .from(posts)
    .limit(10)
    .offset((page - 1) * 10)

  return NextResponse.json({ data, page })
}

export async function POST(request: Request) {
  const body = await request.json()

  const [post] = await db.insert(posts).values({ title: body.title, content: body.content }).returning()

  return NextResponse.json(post, { status: 201 })
}
```

Notice `GET` and `POST` are named exports. Next.js routes the HTTP method to the matching export automatically.

---

## Validation with Zod

Never trust input. A `POST` without validation is a liability.

```typescript
import { z } from 'zod'

const CreatePostSchema = z.object({
  title: z.string().min(1).max(120),
  content: z.string().min(1),
  tags: z.array(z.string()).optional().default([]),
})

export async function POST(request: Request) {
  const body = await request.json()
  const parsed = CreatePostSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })
  }

  // safe to use parsed.data now
}
```

`safeParse` returns `{ success: true, data }` or `{ success: false, error }` — never throws. Pair it with a `422 Unprocessable Entity` status and you have a proper contract with your clients.

---

## Authentication Middleware

Protecting routes should happen at the edge, before the handler even runs.

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('session')?.value

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/api/admin/:path*'],
}
```

The `matcher` pattern restricts middleware to admin routes only. Public endpoints are unaffected.

---

## Streaming with Server Components

One underused feature: streaming partial responses while data loads.

![size=medium&caption=Browser receives shell HTML immediately; skeleton replaced by streamed content.&alt=Suspense streaming diagram&expand=true](https://picsum.photos/id/11/800/400)

```tsx
import { Skeleton } from '@/components/Skeleton'
import { Suspense } from 'react'

import { PostList } from './PostList'

export default function BlogPage() {
  return (
    <main>
      <h1>Latest Posts</h1>
      <Suspense fallback={<Skeleton count={5} />}>
        <PostList />
      </Suspense>
    </main>
  )
}
```

`PostList` is an async server component that fetches data. The browser receives the shell HTML immediately, then the streamed content replaces the skeleton — no client JavaScript required for the data fetch.

---

## Common Pitfalls

### 1. Mixing server and client imports

If a server component imports a module that uses `window` or `document`, the build will fail. The fix is `'use client'` at the top of the offending file, or using a dynamic import with `ssr: false`.

### 2. Forgetting to `await` params

In Next.js 15+, `params` is a `Promise`. This breaks silently if you forget:

```typescript
// ❌ Wrong
export default function Page({ params }: { params: { id: string } }) {
  const { id } = params
}

// ✅ Correct
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
}
```

### 3. Over-fetching in layouts

Layouts re-render on every navigation. If your root layout fetches the user session, it runs on _every_ page load. Cache aggressively with `unstable_cache` or move the fetch as close to where data is consumed as possible.

---

## Performance Numbers

After migrating a production app from Pages Router to App Router, these were the results:

| Metric    | Before | After | Change |
| --------- | ------ | ----- | ------ |
| LCP       | 3.2s   | 1.1s  | −66%   |
| TTFB      | 820ms  | 210ms | −74%   |
| JS bundle | 487kb  | 198kb | −59%   |

The bundle reduction alone is significant. Server components ship _zero_ JavaScript, so every component you convert reduces what the browser has to parse and execute.

---

## Image Click to Enlarge

All images are clickable — click any image to open it in a lightbox modal. The modal shows the full image, caption (if any), and an "Open original" link.

![size=medium&caption=Click me to enlarge.&alt=A forest road&expand=true](https://picsum.photos/id/11/800/400)

![size=small&align=right&caption=Small aligned images expand too.&alt=Right-aligned thumbnail&expand=true](https://picsum.photos/id/11/600/400)

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

---

## Image Alignment Test

Default (no params — full width):

![Full width landscape](https://picsum.photos/id/11/2500/1667)

Full width with caption below:

![caption=A winding road through a dense forest at golden hour.&alt=Forest road](https://picsum.photos/id/11/2500/1667)

Small, right-aligned with caption below — text wraps to the left:

![size=small&align=right&caption=A quiet path through the trees.&alt=Right-aligned thumbnail](https://picsum.photos/id/11/600/400)

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.

Small, left-aligned with caption above — text wraps to the right:

![size=small&align=left&caption=Photo taken at sunrise.&caption-pos=top&alt=Left-aligned thumbnail](https://picsum.photos/id/11/600/400)

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.

Medium, centered — caption below:

![size=medium&caption=The road less travelled.&alt=Medium centered image](https://picsum.photos/id/11/800/400)

Medium, centered — caption above:

![size=medium&caption=The road less travelled.&caption-pos=top&alt=Medium centered image](https://picsum.photos/id/11/800/400)

---

## Embed Test

YouTube video (4K nature footage):

```youtube
https://www.youtube.com/embed/LXb3EKWsInQ
```

Wikiloc trail (Ganekogorta, Basque Country):

```wikiloc
https://www.wikiloc.com/wikiloc/embedv2.do?id=109455237&elevation=on&images=on&maptype=H
```

OpenStreetMap location:

```openstreetmap
https://www.openstreetmap.org/export/embed.html?bbox=-3.7054%2C40.4153%2C-3.6854%2C40.4253&layer=mapnik&marker=40.4203%2C-3.6954
```

Google Maps embed:

```maps
https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d12150.123456789!2d-3.7037902!3d40.4167754!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd422997800a3c81%3A0xc436dec1618c2269!2sMadrid%2C%20Spain!5e0!3m2!1sen!2ses!4v1234567890
```

---

## Wrapping Up

App Router is not just a new file structure — it is a different philosophy. Server-first, streaming-native, and edge-ready. The learning curve is real, but the performance floor it sets is considerably higher than what was achievable before.

Start by converting leaf components (those with no children) to server components first. Work upward. The `'use client'` boundary will naturally emerge at the right abstraction level.

The code shown here is production-ready. Clone it, adapt it, ship it.
