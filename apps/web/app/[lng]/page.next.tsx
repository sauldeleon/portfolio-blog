'use client'

import { HomePage } from '@web/components/HomePage/HomePage'

interface PageProps {
  params: {
    lng: string
  }
}

export default function Page({ params: { lng } }: PageProps) {
  return <HomePage lng={lng} />
}
