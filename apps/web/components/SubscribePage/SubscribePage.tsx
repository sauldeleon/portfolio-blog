import { SubscribeForm } from '@web/components/SubscribeForm'
import { Locale } from '@web/lib/db/schema'

import { StyledPage } from './SubscribePage.styles'

export interface SubscribePageProps {
  lng: Locale
}

export function SubscribePage({ lng }: SubscribePageProps) {
  return (
    <StyledPage>
      <SubscribeForm lng={lng} />
    </StyledPage>
  )
}
