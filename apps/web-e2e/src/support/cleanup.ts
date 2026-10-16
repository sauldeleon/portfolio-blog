/**
 * Cleans up what an admin e2e spec created, whether its tests passed or failed.
 *
 * Specs register the exact name of everything they are about to create with
 * `trackCreated`; `cleanupE2eData` (run from an `after` hook) deletes only
 * those items, matched by exact name. Nothing else is ever touched, and as a
 * second guard, names that do not start with `e2e` are refused.
 *
 * A request the page fired before the test failed can still land while the
 * cleanup runs (e.g. a late unpublish that turns an archived post back into a
 * draft), so the cleanup re-checks what is left and retries. If anything
 * tracked survives every attempt, the hook fails so CI reports it.
 *
 * Uses the session the spec already has. Logs in through the API only when
 * there is none, to stay clear of the login rate limit.
 */
type Kind = 'posts' | 'series' | 'categories' | 'images'

interface AdminPost {
  id: string
  status: 'draft' | 'published' | 'archived'
  titleEn: string | null
  titleEs: string | null
}

const E2E_EMAIL = 'e2e@e2e.com'
const IMAGE_FOLDER = 'sawl.dev - blog'
const MAX_ATTEMPTS = 3
const RETRY_DELAY_MS = 2000

const created: Record<Kind, Set<string>> = {
  posts: new Set(),
  series: new Set(),
  categories: new Set(),
  images: new Set(),
}

/** Registers a post title, series id, category slug or image name for cleanup. */
export function trackCreated(kind: Kind, name: string) {
  if (!/^e2e/i.test(name)) {
    throw new Error(`Refusing to track "${name}" for cleanup: no e2e prefix`)
  }
  created[kind].add(name)
}

function request(method: string, url: string, body?: Cypress.RequestBody) {
  return cy.request({ method, url, body, failOnStatusCode: false, log: false })
}

function ensureSession() {
  return request('GET', '/api/series/').then((res) => {
    if (res.status !== 401) return
    return cy.env(['E2E_PASSWORD']).then(({ E2E_PASSWORD }) =>
      request('GET', '/api/auth/csrf/').then(({ body }) =>
        cy.request({
          method: 'POST',
          url: '/api/auth/callback/credentials/',
          form: true,
          failOnStatusCode: false,
          log: false,
          body: {
            csrfToken: body.csrfToken,
            email: E2E_EMAIL,
            password: E2E_PASSWORD,
          },
        }),
      ),
    )
  })
}

function trackedPosts(): Cypress.Chainable<AdminPost[]> {
  return request('GET', '/api/posts/?status=all').then(({ body }) =>
    ((body?.data ?? []) as AdminPost[]).filter(
      (post) =>
        (!!post.titleEn && created.posts.has(post.titleEn)) ||
        (!!post.titleEs && created.posts.has(post.titleEs)),
    ),
  )
}

function trackedSeries(): Cypress.Chainable<string[]> {
  return request('GET', '/api/series/').then(({ body }) =>
    ((body?.data ?? []) as { id: string }[])
      .map(({ id }) => id)
      .filter((id) => created.series.has(id)),
  )
}

function trackedCategories(): Cypress.Chainable<string[]> {
  return request('GET', '/api/categories/?admin=1').then(({ body }) =>
    ((body?.data ?? []) as { slug: string }[])
      .map(({ slug }) => slug)
      .filter((slug) => created.categories.has(slug)),
  )
}

function trackedImages(): Cypress.Chainable<string[]> {
  const found: string[] = []
  created.images.forEach((name) => {
    const publicId = `${IMAGE_FOLDER}/${name}`
    request('GET', `/api/images/?search=${encodeURIComponent(name)}`).then(
      ({ body }) => {
        const images = (body?.images ?? []) as { publicId: string }[]
        if (images.some((image) => image.publicId === publicId)) {
          found.push(publicId)
        }
      },
    )
  })
  return cy.wrap(found, { log: false })
}

function deleteTracked() {
  // Posts first: series and categories refuse deletion while posts use them.
  trackedPosts().then((posts) => {
    posts.forEach((post) => {
      cy.log(`cleanup: post "${post.titleEn ?? post.titleEs}"`)
      if (post.status === 'published') {
        request('PUT', `/api/posts/${post.id}/`, { status: 'draft' })
      }
      if (post.status !== 'archived') {
        request('DELETE', `/api/posts/${post.id}/`)
      }
      request('DELETE', `/api/posts/${post.id}/?hard=true`)
    })
  })
  trackedSeries().then((ids) => {
    ids.forEach((id) => {
      cy.log(`cleanup: series ${id}`)
      request('DELETE', `/api/series/${encodeURIComponent(id)}/`)
    })
  })
  trackedCategories().then((slugs) => {
    slugs.forEach((slug) => {
      cy.log(`cleanup: category ${slug}`)
      request('DELETE', `/api/categories/${encodeURIComponent(slug)}/`)
    })
  })
  trackedImages().then((publicIds) => {
    publicIds.forEach((publicId) => {
      cy.log(`cleanup: image ${publicId}`)
      const path = publicId.split('/').map(encodeURIComponent).join('/')
      request('DELETE', `/api/images/${path}/`)
    })
  })
}

function remaining(): Cypress.Chainable<string[]> {
  const left: string[] = []
  trackedPosts().then((posts) =>
    posts.forEach((p) =>
      left.push(`post "${p.titleEn ?? p.titleEs}" (${p.status})`),
    ),
  )
  trackedSeries().then((ids) => ids.forEach((id) => left.push(`series ${id}`)))
  trackedCategories().then((slugs) =>
    slugs.forEach((slug) => left.push(`category ${slug}`)),
  )
  trackedImages().then((ids) => ids.forEach((id) => left.push(`image ${id}`)))
  return cy.wrap(left, { log: false })
}

function cleanupAttempt(attempt: number): void {
  deleteTracked()
  remaining().then((left) => {
    if (left.length === 0) return
    if (attempt < MAX_ATTEMPTS) {
      // Back-off on purpose: give late requests from the page time to land.
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(RETRY_DELAY_MS, { log: false })
      cleanupAttempt(attempt + 1)
      return
    }
    throw new Error(
      `e2e cleanup left data behind after ${MAX_ATTEMPTS} attempts: ${left.join(', ')}`,
    )
  })
}

export function cleanupE2eData() {
  const tracked = Object.values(created).some((names) => names.size > 0)
  if (!tracked) return

  ensureSession()
  cleanupAttempt(1)
  cy.then(() => {
    Object.values(created).forEach((names) => names.clear())
  })
}
