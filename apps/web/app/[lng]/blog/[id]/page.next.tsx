import { notFound, redirect } from 'next/navigation'

import { getPostByNumber } from '@web/lib/db/queries/posts'

interface RouteProps {
  params: Promise<{ lng: string; id: string }>
}

export default async function PostRedirectPage({ params }: RouteProps) {
  const { lng, id } = await params
  const postNumber = parseInt(id, 10)
  if (isNaN(postNumber)) return notFound()
  const post = await getPostByNumber(postNumber, lng as 'en' | 'es')
  if (!post) return notFound()
  redirect(`/${lng}/blog/${post.postNumber}/${post.slug}`)
}
