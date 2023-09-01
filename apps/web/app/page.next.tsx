import { redirect } from 'next/navigation'

import { fallbackLng } from '@web/i18n/settings'

export default function RootPage() {
  // check localStorage
  // // create a custom useStorage hook that, given a storage (localStorage, sessionStorage, CustomStorage), will have setter and getter
  // if not in localStorage, check browser prefered language
  // if not preferred language, redirect to fallback
  redirect(`/${fallbackLng}`)
  return null
}
