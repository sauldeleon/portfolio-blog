# [Storage] Cloudinary Image Upload

**Labels:** `blog`, `api`, `infra`  
**Milestone:** Foundation  
**Depends on:** #03 (auth middleware)  
**Blocks:** #11 (post editor), #12 (image manager)

## Context

All blog images hosted on Cloudinary. `next-cloudinary` for rendering. Server-side signed upload via `POST /api/upload` (admin-only).

## Endpoint

### `POST /api/upload`

- Auth required (session)
- Accepts `multipart/form-data` with `file` field
- Optional `altText` field (stored in Cloudinary `context` metadata)
- Upload to Cloudinary folder: `sawl.dev - blog`
- Returns:

```ts
{
  url: string,       // Cloudinary secure_url
  publicId: string,  // Cloudinary public_id
  width: number,
  height: number,
  altText: string,
}
```

## Image Rendering

MDX posts use custom `<BlogImage>` component:

```mdx
<BlogImage
  src="blog/my-image"
  alt="Description"
  position="left" | "right" | "center" | "full"
  caption="Optional caption"
/>
```

`position` values:

- `full` — full width, edge-to-edge
- `center` — centered, max-width constrained
- `left` / `right` — float with text wrap (desktop), stacked (mobile)

## Tasks

### Vercel env var setup (Cloudinary is third-party — not auto-injected)

- [ ] Add to Vercel Dashboard → project → **Settings** → **Environment Variables** for all environments (Production, Preview, Development):
  - `CLOUDINARY_CLOUD_NAME` = `dmpaja1mw`
  - `CLOUDINARY_API_KEY` = (from Cloudinary dashboard)
  - `CLOUDINARY_API_SECRET` = (from Cloudinary dashboard)
  - Or use the combined `CLOUDINARY_URL` = `cloudinary://API_KEY:API_SECRET@dmpaja1mw` (Cloudinary SDK auto-configures from this)
- [ ] Pull to local: `vercel env pull .env.local`
- [ ] Add keys (no values) to `.env.local.example`

### Code

- [ ] Install: `next-cloudinary`, `cloudinary`
- [ ] Create `lib/cloudinary/upload.ts` — server-side upload helper using signed upload preset
- [ ] Create `app/api/upload/route.ts` — POST handler (auth-guarded)
  - Parse multipart with `formidable` or native `request.formData()`
  - Call Cloudinary upload API
  - Return typed response
- [ ] Create `libs/blog-image/` lib:
  - `BlogImage.tsx` — `CldImage` wrapper with position prop
  - `BlogImage.spec.tsx` — test all position variants render correctly
  - `BlogImage.styles.ts` — styled-components for each position variant
  - `index.ts`
- [ ] Register `BlogImage` in MDX components map (used in post renderer)
- [ ] Add `next.config` Cloudinary domain to `images.remotePatterns`
- [ ] Create `lib/cloudinary/upload.spec.ts` — test upload helper (mock Cloudinary SDK)
- [ ] Create `app/api/upload/route.spec.ts` — test auth guard, file validation (size, type), 413/415 responses

## Acceptance Criteria

- [ ] `POST /api/upload` without session → 401
- [ ] `POST /api/upload` with valid session + image file → returns Cloudinary URL
- [ ] `<BlogImage position="left">` renders image floated left on desktop, stacked on mobile
- [ ] `<BlogImage position="full">` renders edge-to-edge
- [ ] 100% test coverage on upload handler + BlogImage component

## Notes

- Use **signed uploads** (not unsigned) — API secret stays server-side
- Max file size: 10 MB — validate before upload, return 413 if exceeded
- Accept: `image/jpeg`, `image/png`, `image/webp`, `image/gif` — reject others with 415
- Cloudinary folder: `sawl.dev - blog` for all blog images
