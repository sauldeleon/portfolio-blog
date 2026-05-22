import { BlogPage } from '@web/components/BlogPage/BlogPage'
import { getServerTranslation } from '@web/i18n/server'
import { Locale } from '@web/lib/db/schema'
import { buildAlternates } from '@web/utils/metadata/inLanguage'
import { getSiteUrl } from '@web/utils/url/generateUrl'

export const revalidate = 60

interface RouteProps {
  params: Promise<{ lng: Locale }>
  searchParams: Promise<{
    page?: string
    categories?: string
    tags?: string
    q?: string
    year?: string
    month?: string
  }>
}

export async function generateMetadata({ params }: RouteProps) {
  const { lng } = await params
  const { t } = await getServerTranslation({ ns: 'blogPage', language: lng })
  const ogImageUrl = `${getSiteUrl()}/og/blog.png`

  return {
    title: t('meta.title'),
    description: t('meta.description'),
    alternates: buildAlternates(lng, 'blog/'),
    openGraph: {
      images: [{ url: ogImageUrl, width: 1731, height: 909 }],
    },
    twitter: {
      card: 'summary_large_image' as const,
      images: [{ url: ogImageUrl, width: 1731, height: 909 }],
    },
  }
}

export default async function Page({ params, searchParams }: RouteProps) {
  const { lng } = await params
  const { page, categories, tags, q, year, month } = await searchParams
  return (
    <BlogPage
      lng={lng}
      page={page}
      categories={categories}
      tags={tags}
      q={q}
      year={year}
      month={month}
    />
  )
}
