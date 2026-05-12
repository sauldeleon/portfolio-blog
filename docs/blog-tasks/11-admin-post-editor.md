# [Admin] Post Editor

**Labels:** `blog`, `cms`  
**Milestone:** Admin CMS  
**Depends on:** #10 (post list), #04 (Cloudinary upload)  
**Blocks:** #12 (image manager)

## Context

Core admin feature. MDX editor with live preview, image insertion, cover upload, metadata fields, and publish controls. Accessed at `/admin/posts/new` and `/admin/posts/[id]`.

## Layout

```
┌─────────────────────────────────────────────┐
│ ← Back   [Post title input]    [Save Draft] [Publish] │
├──────────────────┬──────────────────────────┤
│                  │                          │
│  MDX Editor      │  Live Preview            │
│  (left panel)    │  (right panel)           │
│                  │                          │
├──────────────────┴──────────────────────────┤
│ Metadata sidebar / accordion:               │
│  Slug | Category | Tags | Author | Cover   │
│  Excerpt | Schedule | Series               │
└─────────────────────────────────────────────┘
```

## MDX Editor

Use `@uiw/react-md-editor` (SSR-safe, no webpack config needed, supports custom commands).

- Toolbar: Bold, Italic, Heading, Link, Blockquote, Code, Code block, Image insert, Divider, Preview toggle
- Custom toolbar command: **Insert Image** → opens image picker modal (see #12)
- Custom toolbar command: **Image position picker** → after inserting image, wrap in `<BlogImage position="...">` MDX

## Live Preview

Right panel renders MDX using same `renderMDX` from `lib/mdx/renderMDX.ts`.  
Debounced re-render (300ms after last keystroke) to avoid performance issues.

## Metadata Fields

| Field            | Input type                        | Notes                                                  |
| ---------------- | --------------------------------- | ------------------------------------------------------ |
| Title            | text                              | Required                                               |
| Slug             | text                              | Auto-generated from title, editable. Show URL preview. |
| Excerpt          | textarea                          | Required, max 280 chars, char counter                  |
| Category         | `<select>` dropdown               | Populated from `GET /api/categories` — not free-form   |
| Tags             | tag input (comma-sep or Enter)    |                                                        |
| Author           | text                              | Pre-filled from env/session                            |
| Cover image      | image upload (drag+drop or click) | Uploads to Cloudinary, shows preview                   |
| Cover alt text   | text                              | Accessibility, required if cover set                   |
| Series ID        | text                              | Optional grouping                                      |
| Series order     | number                            | Optional                                               |
| Schedule publish | datetime-local                    | Sets `scheduledAt`                                     |

## Action Buttons

- **Save Draft** — `PUT /api/posts/[id]` with `{ status: 'draft' }` (no publish date change)
- **Publish** — `PUT /api/posts/[id]` with `{ status: 'published', publishedAt: new Date() }`
- **Schedule** — `PUT /api/posts/[id]` with `{ status: 'draft', scheduledAt: selectedDate }`
- **Copy Preview Link** — copies `/blog/preview/[previewToken]` to clipboard
- **Delete** — confirms then `DELETE /api/posts/[id]`, redirect to `/admin/posts`

## Tasks

- [ ] Install: `@uiw/react-md-editor`
- [ ] Create `app/admin/posts/new/page.next.tsx`
- [ ] Create `app/admin/posts/[id]/page.next.tsx`
- [ ] Create `app/admin/posts/_components/PostEditor.tsx` (Client Component — large, stateful)
- [ ] Create `app/admin/posts/_components/MetadataPanel.tsx`
- [ ] Create `app/admin/posts/_components/SlugInput.tsx` (auto-gen + editable + preview)
- [ ] Create `app/admin/posts/_components/TagInput.tsx`
- [ ] Create `app/admin/posts/_components/CoverImageUpload.tsx`
- [ ] Implement slug auto-generation: `slugify(title)` — lowercase, replace spaces with `-`, strip special chars
- [ ] Debounced MDX preview using `useDebounce` hook
- [ ] Auto-save draft every 30s (if content changed) — show "Saved" indicator
- [ ] Unsaved changes warning on navigate away (`beforeunload` event)
- [ ] "Insert Image" modal: search uploaded images, select, pick position, insert MDX tag
- [ ] Cover image: drag-drop or click → upload via `POST /api/upload` → show preview

## Acceptance Criteria

- [ ] Creating new post at `/admin/posts/new` saves to DB
- [ ] Editing existing post at `/admin/posts/[id]` pre-fills all fields
- [ ] Slug auto-generates from title, is editable
- [ ] MDX preview updates ~300ms after typing stops
- [ ] Cover image uploads to Cloudinary and previews in form
- [ ] Publish button sets status + publishedAt
- [ ] Schedule button sets scheduledAt
- [ ] Copy Preview Link copies correct URL to clipboard
- [ ] Auto-save fires every 30s when content changed
- [ ] 100% test coverage on utilities (slugify, debounce); components use interaction tests

## Notes

- `@uiw/react-md-editor` must be dynamically imported with `ssr: false` (`next/dynamic`)
- Preview panel: render MDX server-side via API call, not client-side, to avoid shipping rehype plugins to client
  - Add `POST /api/preview-mdx` endpoint (admin-only) that accepts `{ content: string }` and returns rendered HTML
- Slugify: use `slug` npm package or implement: `str.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-')`
