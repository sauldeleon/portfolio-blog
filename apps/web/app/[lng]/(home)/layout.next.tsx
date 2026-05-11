import { getServerTranslation } from '@web/i18n/server'

import { HomeLayoutContent } from './HomeLayoutContent'

interface HomeLayoutProps {
  children: React.ReactNode
  params: Promise<{ lng: string }>
}

export default async function HomeLayout({
  children,
  params,
}: HomeLayoutProps) {
  const { lng } = await params
  const { t } = await getServerTranslation({ ns: 'homepage', language: lng })

  const summaryRaw = t('summary', { returnObjects: true })
  const summary: string[] = Array.isArray(summaryRaw) ? summaryRaw : []

  return (
    <HomeLayoutContent
      lng={lng}
      explore={t('explore')}
      aboutMe={t('aboutMe')}
      experience={t('experience')}
      summary={summary}
      attributes={{
        mountaineer: t('attributes.mountaineer'),
        petter: t('attributes.petter'),
        gamer: t('attributes.gamer'),
        photographer: t('attributes.photographer'),
      }}
    >
      {children}
    </HomeLayoutContent>
  )
}
