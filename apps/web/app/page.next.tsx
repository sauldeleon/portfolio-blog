'use client'

import { redirect } from 'next/navigation'

import { useDefaultLanguage } from '@web/hooks/useDefaultLanguage/useDefaultLanguage'

export default function RootPage() {
  const lang = useDefaultLanguage()
  redirect(`/${lang}`)
  return null
}
