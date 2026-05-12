import { notFound, redirect } from 'next/navigation'

import { getPostById } from '@web/lib/db/queries/posts'

interface RouteProps {
  params: Promise<{ lng: string; id: string }>
}

export default async function PostRedirectPage({ params }: RouteProps) {
  const { lng, id } = await params
  const post = await getPostById(id, lng as 'en' | 'es')
  if (!post) return notFound()
  redirect(`/${lng}/blog/${post.id}/${post.slug}`)
}
