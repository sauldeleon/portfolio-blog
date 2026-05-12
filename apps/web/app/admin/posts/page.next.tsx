import { getAllPosts } from '@web/lib/db/queries/posts'

import { PostTable } from './PostTable'

export default async function AdminPostsPage() {
  const posts = await getAllPosts()
  return (
    <div data-testid="admin-posts-page">
      <div>
        <h1>Posts</h1>
        <a href="/admin/posts/new">New post</a>
      </div>
      <PostTable posts={posts} />
    </div>
  )
}
