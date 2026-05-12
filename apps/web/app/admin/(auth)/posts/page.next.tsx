import { getServerTranslation } from '@web/i18n/server'
import { getAllPosts } from '@web/lib/db/queries/posts'

import { PostsPageView } from './components/PostsPageView'

export const dynamic = 'force-dynamic'

export default async function AdminPostsPage() {
  const { t } = await getServerTranslation({ language: 'en', ns: 'admin' })
  const posts = await getAllPosts()
  return (
    <PostsPageView
      posts={posts}
      title={t('posts.title')}
      newPostLabel={t('posts.newPost')}
    />
  )
}
