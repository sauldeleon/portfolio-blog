import { ScriptProps } from 'next/script'
import { Metadata, ResolvingMetadata } from 'next/types'

import { HomePage } from '@web/components/HomePage/HomePage'
import { getServerTranslation } from '@web/i18n/server'

export async function generateMetadata(
  props: ScriptProps,
  parent?: ResolvingMetadata
): Promise<Metadata> {
  const { t } = await getServerTranslation()

  return {
    title: 'Saúl de León Guerrero',
    description: t('metadata.description'),
  }
}

export default function Page() {
  return <HomePage />
}
