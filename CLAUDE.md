## Monorepo

Nx monorepo. Apps: `web` (Next.js). E2E: `web-e2e` (Cypress). Libs under `libs/`.

## Commands

Use `yarn` for all commands.

| Action    | Command             |
| --------- | ------------------- |
| Start web | `yarn start:web`    |
| Test web  | `yarn test:web`     |
| Test libs | `yarn test:libs`    |
| Test all  | `yarn test:all`     |
| Build all | `yarn build:all`    |
| Build web | `yarn build:web`    |
| Format    | `yarn format:write` |
| Dep graph | `yarn dep-graph`    |

Run tests for single file: `yarn nx test <app> --testFile=<path>`

## Workflow

1. Branch from `main`
2. Implement
3. Write tests — 100% coverage required (statements, branches, functions, lines)
4. Run tests: verify pass, coverage 100%, snapshots updated
5. Add E2E test in `apps/web-e2e` if change affects user-facing flows
6. Commit and push
7. Open PR targeting `main`

## Testing

- Jest + @testing-library/react
- **100% coverage threshold** — no exceptions
- **Snapshots** — update with `-u` when they fail after intentional change: `yarn nx test <app> -- -u`
- Test files: `*.spec.ts` / `*.spec.tsx` co-located with source
- Setup: `jest.setupafterenv.ts`

## Design Patterns

- **Router**: App Router (`/app` directory)
- **File naming**:
  - Next.js pages/layouts: `*.next.tsx`
  - Components: `PascalCase.tsx` + `PascalCase.spec.tsx` + `PascalCase.styles.ts` + `index.ts`
  - Hooks: `useCamelCase.ts`
- **Hook naming**: only name functions/variables with `use` prefix if they are React hooks
- **Styling**: styled-components, co-located in `ComponentName.styles.ts`
- **i18n**: `[lng]` route segment — language passed as param. Use `libs/i18n-*` for translations
- **Path aliases**: `@sdlgr/<lib>` for libs (e.g. `@sdlgr/button`, `@sdlgr/header`)

## Libs

| Path                     | Purpose                   |
| ------------------------ | ------------------------- |
| `@sdlgr/assets`          | Static assets             |
| `@sdlgr/button`          | Button component          |
| `@sdlgr/circle-link`     | Circle link component     |
| `@sdlgr/footer`          | Footer component          |
| `@sdlgr/header`          | Header component          |
| `@sdlgr/link`            | Link component            |
| `@sdlgr/modal`           | Modal component           |
| `@sdlgr/typography`      | Typography components     |
| `@sdlgr/visually-hidden` | Visually hidden component |
| `@sdlgr/main-theme`      | Theme tokens              |
| `@sdlgr/i18n-client`     | Client-side i18n          |
| `@sdlgr/i18n-server`     | Server-side i18n          |
| `@sdlgr/i18n-config`     | i18n configuration        |
| `@sdlgr/i18n-tools`      | i18n utilities            |
| `@sdlgr/storage`         | Storage helpers           |
| `@sdlgr/mocks`           | Shared test mocks         |
| `@sdlgr/test-utils`      | Test utilities            |
| `@sdlgr/types`           | Global TypeScript types   |
| `@sdlgr/global-types`    | Global type declarations  |
| `@sdlgr/use-is-bot`      | Bot detection hook        |

## Pre-commit Hooks

Husky runs on commit:

- lint-staged (ESLint + Prettier on staged files)

Do not skip hooks (`--no-verify`). Fix the underlying issue instead.

## Skills

Agent skills are locked in `skills-lock.json`. To install:

```bash
claude skills install
```

## Commits

- Do not add Claude co-authorship to commit messages
