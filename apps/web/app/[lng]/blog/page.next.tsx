import { BlogPage } from '@web/components/BlogPage/BlogPage'
import { Locale } from '@web/lib/db/schema'
import { buildAlternates } from '@web/utils/metadata/inLanguage'

interface RouteProps {
  params: Promise<{ lng: Locale }>
  searchParams: Promise<{
    page?: string
    category?: string
    tag?: string
    q?: string
  }>
}

export async function generateMetadata({ params }: RouteProps) {
  const { lng } = await params
  return {
    title: 'Blog',
    robots: { index: false, follow: false },
    alternates: buildAlternates(lng, 'blog/'),
  }
}

export default async function Page({ params, searchParams }: RouteProps) {
  const { lng } = await params
  const { page, category, tag, q } = await searchParams
  return <BlogPage lng={lng} page={page} category={category} tag={tag} q={q} />
}
