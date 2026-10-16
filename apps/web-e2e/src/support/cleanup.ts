/**
 * Cleans up what an admin e2e spec created, whether its tests passed or failed.
 *
 * Specs register the exact name of everything they are about to create with
 * `trackCreated`; `cleanupE2eData` (run from an `after` hook) deletes only
 * those items, matched by exact name. Nothing else is ever touched, and as a
 * second guard, names that do not start with `e2e` are refused.
 *
 * Uses the session the spec already has. Logs in through the API only when
 * there is none, to stay clear of the login rate limit.
 */
type Kind = 'posts' | 'series' | 'categories' | 'images'

interface AdminPost {
  id: string
  status: 'draft' | 'published' | 'archived'
  title_en: string | null
  title_es: string | null
}

const E2E_EMAIL = 'e2e@e2e.com'
const IMAGE_FOLDER = 'sawl.dev - blog'

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

function cleanupPosts(titles: Set<string>) {
  return request('GET', '/api/posts/?status=all').then(({ body }) => {
    const posts = ((body?.data ?? []) as AdminPost[]).filter(
      (post) =>
        (!!post.title_en && titles.has(post.title_en)) ||
        (!!post.title_es && titles.has(post.title_es)),
    )
    posts.forEach((post) => {
      cy.log(`cleanup: post "${post.title_en ?? post.title_es}"`)
      if (post.status === 'published') {
        request('PUT', `/api/posts/${post.id}/`, { status: 'draft' })
      }
      if (post.status !== 'archived') {
        request('DELETE', `/api/posts/${post.id}/`)
      }
      request('DELETE', `/api/posts/${post.id}/?hard=true`)
    })
  })
}

function cleanupSeries(ids: Set<string>) {
  return request('GET', '/api/series/').then(({ body }) => {
    ;((body?.data ?? []) as { id: string }[])
      .filter(({ id }) => ids.has(id))
      .forEach(({ id }) => {
        cy.log(`cleanup: series ${id}`)
        request('DELETE', `/api/series/${encodeURIComponent(id)}/`)
      })
  })
}

function cleanupCategories(slugs: Set<string>) {
  return request('GET', '/api/categories/?admin=1').then(({ body }) => {
    ;((body?.data ?? []) as { slug: string }[])
      .filter(({ slug }) => slugs.has(slug))
      .forEach(({ slug }) => {
        cy.log(`cleanup: category ${slug}`)
        request('DELETE', `/api/categories/${encodeURIComponent(slug)}/`)
      })
  })
}

function cleanupImages(names: Set<string>) {
  names.forEach((name) => {
    const publicId = `${IMAGE_FOLDER}/${name}`
    request('GET', `/api/images/?search=${encodeURIComponent(name)}`).then(
      ({ body }) => {
        const exists = ((body?.images ?? []) as { publicId: string }[]).some(
          (image) => image.publicId === publicId,
        )
        if (!exists) return
        cy.log(`cleanup: image ${publicId}`)
        const path = publicId.split('/').map(encodeURIComponent).join('/')
        request('DELETE', `/api/images/${path}/`)
      },
    )
  })
}

export function cleanupE2eData() {
  const tracked = Object.values(created).some((names) => names.size > 0)
  if (!tracked) return

  ensureSession()
  // Posts first: series and categories refuse deletion while posts use them.
  cleanupPosts(created.posts)
  cleanupSeries(created.series)
  cleanupCategories(created.categories)
  cleanupImages(created.images)
  cy.then(() => {
    Object.values(created).forEach((names) => names.clear())
  })
}
