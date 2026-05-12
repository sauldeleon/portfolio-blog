# [Admin] Image Manager

**Labels:** `blog`, `cms`  
**Milestone:** Admin CMS  
**Depends on:** #04 (Cloudinary upload), #11 (post editor)

## Context

Simple image library in the admin CMS. Lists all images uploaded to Cloudinary `blog/` folder. Used as the image picker modal in the post editor.

## Endpoint

### `GET /api/images`

- Auth required
- Calls Cloudinary Admin API: `cloudinary.api.resources({ type: 'upload', prefix: 'sawl.dev - blog/', max_results: 100 })`
- Returns:

```ts
{
  images: Array<{
    publicId: string
    url: string
    width: number
    height: number
    format: string
    createdAt: string
    bytes: number
  }>
}
```

### `DELETE /api/images/[publicId]`

- Auth required
- Calls Cloudinary `cloudinary.uploader.destroy(publicId)`
- Returns 204

## UI — `/admin/images`

- Grid of image thumbnails (3 cols desktop, 2 cols mobile)
- Each card: thumbnail, file name, dimensions, size, upload date
- Actions per image: Copy URL | Delete
- Upload button → drag-drop or file picker → `POST /api/upload`
- Pagination (50 per page — Cloudinary cursor-based)
- All images scoped to Cloudinary folder `sawl.dev - blog`

## Picker Modal (used in post editor)

Same image grid, but in a modal with:

- Search/filter by filename
- Single-select — clicking image selects it
- Position picker radio: Left | Center | Right | Full
- Alt text input
- "Insert" button → generates `<BlogImage>` MDX tag and inserts at cursor

## Tasks

- [ ] Create `app/api/images/route.ts` — GET list, POST upload (delegates to #04 handler)
- [ ] Create `app/api/images/[publicId]/route.ts` — DELETE
- [ ] Create `app/admin/images/page.next.tsx`
- [ ] Create `app/admin/images/ImageGrid.tsx` (Client Component)
- [ ] Create `app/admin/images/ImagePickerModal.tsx` (Client Component, used in post editor)
- [ ] Add "Images" nav link to admin layout
- [ ] Copy URL → clipboard with feedback
- [ ] Delete with confirm dialog → removes from Cloudinary + updates list
- [ ] Create `app/api/images/route.spec.ts` — test GET auth guard, Cloudinary response mapping
- [ ] Create `app/api/images/[publicId]/route.spec.ts` — test DELETE auth guard, Cloudinary destroy call
- [ ] Create `app/admin/images/ImageGrid.spec.tsx` — test grid renders, copy URL, delete confirm
- [ ] Create `app/admin/images/ImagePickerModal.spec.tsx` — test search filter, selection, position picker, insert output

## Acceptance Criteria

- [ ] `/admin/images` lists all images from Cloudinary `sawl.dev - blog` folder
- [ ] Upload new image → appears in grid without page reload
- [ ] Delete image → removed from grid + Cloudinary
- [ ] Image picker modal opens from post editor toolbar
- [ ] Selecting image + position + alt text → inserts correct `<BlogImage>` MDX
- [ ] 100% test coverage on API handlers

## Notes

- Cloudinary cloud name: `dmpaja1mw` — hardcode in `lib/cloudinary/config.ts` or read from `CLOUDINARY_CLOUD_NAME` env
- Use `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` env vars
- `CLOUDINARY_URL` env var (full connection string) also supported by Cloudinary SDK auto-config
