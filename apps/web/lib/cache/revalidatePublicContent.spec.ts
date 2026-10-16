/**
 * @vitest-environment node
 */
import { revalidatePath, revalidateTag } from 'next/cache'

import {
  POSTS_CACHE_TAG,
  revalidatePublicContent,
} from './revalidatePublicContent'

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}))

describe('revalidatePublicContent', () => {
  it('expires the posts cache tag immediately', () => {
    revalidatePublicContent()
    expect(revalidateTag).toHaveBeenCalledWith(POSTS_CACHE_TAG, { expire: 0 })
  })

  it('expires every post route pattern as a page', () => {
    revalidatePublicContent()
    expect(revalidatePath).toHaveBeenCalledWith(
      '/[lng]/blog/[id]/[slug]',
      'page',
    )
    expect(revalidatePath).toHaveBeenCalledWith('/[lng]/blog/[id]', 'page')
    expect(revalidatePath).toHaveBeenCalledWith('/[lng]/blog', 'page')
  })

  it('expires the sitemap and the feeds', () => {
    revalidatePublicContent()
    expect(revalidatePath).toHaveBeenCalledWith('/sitemap.xml')
    expect(revalidatePath).toHaveBeenCalledWith('/feed.xml')
    expect(revalidatePath).toHaveBeenCalledWith('/feed.es.xml')
  })
})
