# API App

Go REST API using Gin. Minimal service — primarily a scaffold/placeholder.

## Commands

```bash
yarn start:api      # dev server
yarn test:api       # run tests
yarn build:api      # production build
```

## Folder Structure

```
main.go             # Entry point, router setup, handlers
main_test.go        # Tests
```

## Key Patterns

- **Framework**: Gin (`github.com/gin-gonic/gin`)
- **Tests**: Go standard `testing` package + `github.com/stretchr/testify`
- **Auth**: Basic auth on write routes (`gin.BasicAuth`)
