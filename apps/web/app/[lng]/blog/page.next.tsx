import { BlogPage } from '@web/components/BlogPage/BlogPage'
import { buildAlternates } from '@web/utils/metadata/inLanguage'

interface RouteProps {
  params: Promise<{ lng: string }>
}

export async function generateMetadata({ params }: RouteProps) {
  const { lng } = await params
  return {
    title: 'Blog',
    robots: { index: false, follow: false },
    alternates: buildAlternates(lng, 'blog/'),
  }
}

export default function Page() {
  return <BlogPage />
}
