import { Metadata } from 'next'

import { ContactPage } from '@web/components/ContactPage/ContactPage'

export const metadata: Metadata = {
  description: 'Contact information',
}

export default function Page() {
  return <ContactPage />
}
