# Web App

**Router**: App Router (`/app` directory, Next.js files named `*.next.tsx`)

## Commands

```bash
yarn start:web      # dev server (port 4200)
yarn test:web       # run tests
yarn build:web      # production build
```

## Folder Structure

```
app/
  /[lng]/           # Locale-prefixed routes
    /(home)/        # Home page
    /blog/          # Blog page
    /experience/    # Experience page
    /portfolio/     # Portfolio page
    /[...not-found] # 404 catch-all
  /api/             # API routes
  layout.next.tsx   # Root layout
  page.next.tsx     # Root redirect
components/
  /{PageName}/      # Page-level components (co-located spec + styles)
public/             # Static assets
```

## Path Alias

`@sdlgr/*` → `libs/*`

## Key Patterns

- **File naming**: Next.js pages and layouts use `*.next.tsx` suffix (not `page.tsx` / `layout.tsx`)
- **Styling**: styled-components, co-located in `ComponentName.styles.ts`
- **i18n**: `[lng]` route segment carries locale. Server translations via `@sdlgr/i18n-server`, client via `@sdlgr/i18n-client`
- **Snapshots**: Co-located in `__snapshots__/` folders — update with `yarn nx test web -- -u`

## Testing

- Setup: `jest.setupafterenv.ts` (root)
- Test wrapper: `@sdlgr/test-utils`
- Coverage: 100% required (statements, branches, functions, lines)

## E2E Tests

E2E project: `apps/web-e2e` — Cypress

```bash
yarn nx e2e web-e2e    # run all tests (localhost:4200)
```

## Env Vars

See `.env.example`. Key vars:

- `BASE_URL` — base URL of the app
- `GOOGLE_ANALYTICS_ID` — GA4 measurement ID
- `EXPORT_STATIC_FILES` — enable static export (`true` / `false`)
