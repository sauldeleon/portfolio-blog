# [Admin] Post Editor

**Labels:** `blog`, `cms`  
**Milestone:** Admin CMS  
**Depends on:** #10 (post list), #04 (Cloudinary upload)  
**Blocks:** #12 (image manager)

## Context

Core admin feature. Two-language MDX editor (EN + ES tabs), live preview, image insertion, cover upload, metadata fields, and publish controls. Accessed at `/admin/posts/new` and `/admin/posts/[id]`.

## Layout

```
┌─────────────────────────────────────────────────────────┐
│ ← Back   [Post title — shown for active tab]  [Save Draft] [Publish] │
├───────────────────────────────────────────────────────────┤
│  [EN] [ES]  ← locale tabs                               │
├──────────────────┬────────────────────────────────────────┤
│                  │                                        │
│  MDX Editor      │  Live Preview                          │
│  (left panel)    │  (right panel)                         │
│                  │                                        │
├──────────────────┴────────────────────────────────────────┤
│ Metadata sidebar / accordion (shared across both locales):│
│  Category | Tags | Author | Cover | Series | Schedule    │
└───────────────────────────────────────────────────────────┘
```

## Locale Tabs

Each tab (EN / ES) has its own independent set of locale-specific fields:

| Field   | Input type | Notes                                             |
| ------- | ---------- | ------------------------------------------------- |
| Title   | text       | Required per locale                               |
| Slug    | text       | Auto-generated from title, editable. URL preview. |
| Excerpt | textarea   | Required per locale, max 280 chars, char counter  |
| Content | MDX editor | Required per locale                               |

Switching tabs preserves unsaved content in the other tab (hold both in form state).

## Shared Metadata Fields

Metadata is locale-agnostic — shared between EN and ES tabs:

| Field            | Input type                        | Notes                                                |
| ---------------- | --------------------------------- | ---------------------------------------------------- |
| Category         | `<select>` dropdown               | Populated from `GET /api/categories` — not free-form |
| Tags             | tag input (comma-sep or Enter)    |                                                      |
| Author           | text                              | Pre-filled from env/session                          |
| Cover image      | image upload (drag+drop or click) | Uploads to Cloudinary, shows preview                 |
| Cover alt text   | text                              | Accessibility, required if cover set                 |
| Series ID        | text                              | Optional grouping                                    |
| Series order     | number                            | Optional                                             |
| Schedule publish | datetime-local                    | Sets `scheduledAt`                                   |

## MDX Editor

Use `@uiw/react-md-editor` (SSR-safe, no webpack config needed, supports custom commands).

- Toolbar: Bold, Italic, Heading, Link, Blockquote, Code, Code block, Image insert, Divider, Preview toggle
- Custom toolbar command: **Insert Image** → opens image picker modal (see #12)
- Custom toolbar command: **Image position picker** → after inserting image, wrap in `<BlogImage position="...">` MDX

## Live Preview

Right panel renders MDX using same `renderMDX` from `lib/mdx/renderMDX.ts`.  
Debounced re-render (300ms after last keystroke) to avoid performance issues.

## Action Buttons

- **Save Draft** — `PUT /api/posts/[id]` with current state of both translations + `{ status: 'draft' }`
- **Publish** — disabled if any translation is missing title/content; calls `PUT /api/posts/[id]` with `{ status: 'published', publishedAt: new Date() }` + both translations
- **Schedule** — `PUT /api/posts/[id]` with `{ status: 'draft', scheduledAt: selectedDate }`
- **Copy Preview Link** — copies `/blog/preview/[previewToken]` to clipboard
- **Delete** — confirms then `DELETE /api/posts/[id]`, redirect to `/admin/posts`

## Tasks

- [ ] Install: `@uiw/react-md-editor`
- [ ] Create `app/admin/posts/new/page.next.tsx`
- [ ] Create `app/admin/posts/[id]/page.next.tsx`
- [ ] Create `app/admin/posts/_components/PostEditor.tsx` (Client Component — large, stateful)
  - Manages both `en` and `es` translation state simultaneously
  - Active tab controls which MDX editor + locale fields are visible
- [ ] Create `app/admin/posts/_components/LocaleTab.tsx` — tab switcher (EN / ES)
- [ ] Create `app/admin/posts/_components/TranslationForm.tsx` — title + slug + excerpt + MDX editor for one locale
- [ ] Create `app/admin/posts/_components/MetadataPanel.tsx` — shared metadata fields
- [ ] Create `app/admin/posts/_components/SlugInput.tsx` (auto-gen + editable + preview per locale)
- [ ] Create `app/admin/posts/_components/TagInput.tsx`
- [ ] Create `app/admin/posts/_components/CoverImageUpload.tsx`
- [ ] Implement slug auto-generation per locale: `slugify(title)` — lowercase, replace spaces with `-`, strip special chars
- [ ] Translation completeness indicator: show `EN ✓ / ES ✗` badge in tab header when content missing
- [ ] Publish button disabled with tooltip if any locale missing title or content
- [ ] Debounced MDX preview using `useDebounce` hook (per active tab content)
- [ ] Auto-save draft every 30s (if content changed) — saves both translations — show "Saved" indicator
- [ ] Unsaved changes warning on navigate away (`beforeunload` event)
- [ ] "Insert Image" modal: search uploaded images, select, pick position, insert MDX tag
- [ ] Cover image: drag-drop or click → upload via `POST /api/upload` → show preview

## Acceptance Criteria

- [ ] Creating new post at `/admin/posts/new` saves to DB with both EN and ES translations
- [ ] Editing existing post at `/admin/posts/[id]` pre-fills all fields for both locales
- [ ] Switching tabs preserves content in the other locale tab
- [ ] Slug auto-generates from title independently per locale
- [ ] MDX preview updates ~300ms after typing stops (active tab only)
- [ ] Cover image uploads to Cloudinary and previews in form
- [ ] Publish button disabled when any locale translation is incomplete
- [ ] Publish button sets status + publishedAt when both translations complete
- [ ] Schedule button sets scheduledAt
- [ ] Copy Preview Link copies correct URL to clipboard
- [ ] Auto-save fires every 30s when content changed
- [ ] 100% test coverage on utilities (slugify, debounce); components use interaction tests

## Notes

- `@uiw/react-md-editor` must be dynamically imported with `ssr: false` (`next/dynamic`)
- Preview panel: render MDX server-side via API call, not client-side, to avoid shipping rehype plugins to client
  - Add `POST /api/preview-mdx` endpoint (admin-only) that accepts `{ content: string }` and returns rendered HTML
- Slugify: use `slug` npm package or implement: `str.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-')`
- Save Draft always saves current state of both locales — even if one is empty (partial drafts allowed)
- Publish enforces both locales complete — checked client-side (button state) and server-side (API 422)
